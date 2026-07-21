from contextlib import asynccontextmanager
import time
import cv2
import threading

from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse

from backend.pipeline import CrimeDetectionPipeline
from backend.shared import shared

from fastapi import Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Incident
from backend.models import User
from backend.alert_service import alert_service
from pydantic import BaseModel

from fastapi.staticfiles import StaticFiles

pipeline = CrimeDetectionPipeline()


class OnboardingProfile(BaseModel):
    firebase_uid: str
    name: str
    email: str
    phone: str
    emergency_phone: str | None = None
    emergency_email: str | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    pipeline.start()
    yield
    pipeline.stop()


app = FastAPI(
    title="Crime Detection API",
    version="2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/snapshots",
    StaticFiles(directory="snapshots"),
    name="snapshots",
)


@app.get("/")
def home():
    return {
        "message": "Crime Detection Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/users/onboarding")
def save_onboarding(profile: OnboardingProfile, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.firebase_uid == profile.firebase_uid).first()
    if user is None:
        user = db.query(User).filter(User.email == profile.email).first()

    is_new = user is None
    if is_new:
        user = User(firebase_uid=profile.firebase_uid, email=profile.email)
        db.add(user)

    user.firebase_uid = profile.firebase_uid
    user.name = profile.name
    user.email = profile.email
    user.phone = profile.phone
    user.emergency_phone = profile.emergency_phone
    user.emergency_email = profile.emergency_email
    db.commit()
    db.refresh(user)

    if is_new:
        threading.Thread(target=alert_service.send_surveillance_started, args=(user,), daemon=True).start()

    return {"success": True, "is_new": is_new}


@app.get("/status")
def status():

    with shared.lock:

        return {
            "running": shared.running,
            "camera_connected": shared.camera_connected,
            "backend_connected": True,
            "fps": shared.fps,
            "last_update": (
                shared.last_update.isoformat()
                if shared.last_update
                else None
            ),
        }

@app.get("/prediction")
def prediction():

    with shared.lock:

        return {
            "prediction": shared.latest_prediction,
            "confidence": shared.latest_confidence,
            "class_id": shared.latest_class_id,
            "fps": shared.fps,
            "processing_time": shared.processing_time,
            "last_update": (
                shared.last_update.isoformat()
                if shared.last_update
                else None
            ),
        }


def generate_frames():

    while shared.running:

        with shared.lock:

            if shared.latest_frame is None:
                frame = None
            else:
                frame = shared.latest_frame.copy()

        if frame is None:
            time.sleep(0.01)
            continue

        success, buffer = cv2.imencode(".jpg", frame)

        if not success:
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + buffer.tobytes() +
            b"\r\n"
        )


@app.get("/video_feed")
def video_feed():

    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/snapshot")
def snapshot():

    with shared.lock:

        if shared.latest_frame is None:
            return Response(status_code=404)

        success, buffer = cv2.imencode(".jpg", shared.latest_frame)

        if not success:
            return Response(status_code=500)

    return Response(
        content=buffer.tobytes(),
        media_type="image/jpeg",
    )

@app.get("/active_incident")
def active_incident(
    db: Session = Depends(get_db)
):

    incident = (
        db.query(Incident)
        .filter(
            Incident.status == "ACTIVE"
        )
        .first()
    )

    if incident is None:

        return {
            "active": False
        }

    return {

        "active": True,

        "id": incident.id,

        "type": incident.incident_type,

        "confidence": incident.confidence,

        "snapshot": (
            f"http://localhost:8000/{incident.snapshot_path}"
            if incident.snapshot_path
            else None
        ),

        "created_at": incident.created_at,

        "acknowledged": incident.acknowledged,

    }

@app.get("/incidents")
def incidents(
    db: Session = Depends(get_db)
):

    return (
    db.query(Incident)
    .order_by(
        Incident.created_at.desc()
    )
    .limit(50)
    .all()
)

@app.post("/incident/{incident_id}/acknowledge")
def acknowledge(
    incident_id: int,
    db: Session = Depends(get_db),
):

    incident = db.get(
        Incident,
        incident_id,
    )

    if incident is None:

        return {
            "success": False
        }

    incident.acknowledged = True

    db.commit()

    return {
        "success": True
    }
