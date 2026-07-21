from datetime import datetime
import os
import cv2
import threading

from backend.shared import shared

from backend.database import SessionLocal
from backend.models import Incident
from backend.alert_service import alert_service


class IncidentManager:

    def __init__(self):

        self.active_incident_id = None

        self.anomaly_count = 0

        self.confirmation_threshold = 3
        self.snapshot_dir = "snapshots"

        os.makedirs(
            self.snapshot_dir,
            exist_ok=True,
        )
    def save_snapshot(self):
        with shared.lock:

            if shared.latest_frame is None:

                return ""

            frame = shared.latest_frame.copy()

        filename = datetime.now().strftime(
            "%Y%m%d_%H%M%S.jpg"
        )

        path = os.path.join(
            self.snapshot_dir,
            filename,
        )

        cv2.imwrite(path, frame)

        return path

    def process_prediction(self, prediction, confidence):

        db = SessionLocal()

        try:

            # ------------------------
            # NORMAL
            # ------------------------

            if prediction.lower() == "normal":

                self.anomaly_count = 0

                if self.active_incident_id is not None:

                    incident = db.get(
                        Incident,
                        self.active_incident_id
                    )

                    if incident:

                        incident.status = "RESOLVED"

                        incident.updated_at = datetime.utcnow()

                        db.commit()

                        print(
                            f"✅ Incident {incident.id} resolved"
                        )

                    self.active_incident_id = None

                return

            # ------------------------
            # ANOMALY
            # ------------------------

            self.anomaly_count += 1

            if self.anomaly_count < self.confirmation_threshold:
                return

            # Already active

            if self.active_incident_id is not None:

                incident = db.get(
                    Incident,
                    self.active_incident_id
                )

                if incident:

                    incident.confidence = float(confidence)

                    incident.updated_at = datetime.utcnow()

                    db.commit()

                return

            # ------------------------
            # Create new incident
            # ------------------------

            snapshot = self.save_snapshot()

            incident = Incident(

                incident_type="Anomaly",

                confidence=float(confidence),

                status="ACTIVE",

                acknowledged=False,

                snapshot_path=snapshot,

            )

            db.add(incident)

            db.commit()

            db.refresh(incident)

            self.active_incident_id = incident.id

            threading.Thread(
                target=alert_service.send_anomaly_alert,
                args=(incident.id, prediction, float(confidence)),
                daemon=True,
            ).start()

            print(
                f"🚨 Incident Created #{incident.id}"
            )

        finally:

            db.close()


incident_manager = IncidentManager()
