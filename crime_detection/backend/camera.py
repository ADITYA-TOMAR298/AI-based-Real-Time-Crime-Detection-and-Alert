import cv2
import threading
import queue
import time

from backend.config import (
    CAMERA_SOURCE,
    CAMERA_WIDTH,
    CAMERA_HEIGHT,
    QUEUE_SIZE,
)

from backend.shared import shared


class Camera:

    def __init__(self):
        self.cap = None
        self.thread = None
        self.browser_source = CAMERA_SOURCE == "browser"
        self.frame_queue = queue.Queue(maxsize=QUEUE_SIZE)

        # Cloud services have no physical webcam.  Keep the API healthy until
        # an RTSP stream is provided through CAMERA_SOURCE.
        if CAMERA_SOURCE is None or self.browser_source:
            return

        self.cap = cv2.VideoCapture(CAMERA_SOURCE)
        if not self.cap.isOpened():
            self.cap.release()
            self.cap = None
            return

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)

        shared.camera_connected = True

        self.thread = threading.Thread(
            target=self._capture_loop,
            daemon=True,
        )

    def start(self):
        if self.thread:
            self.thread.start()

    def _capture_loop(self):

        while shared.running:

            ret, frame = self.cap.read()

            if not ret:
                time.sleep(0.01)
                continue

            self.push_frame(frame)

    def push_frame(self, frame):
        """Accept a decoded frame from the browser webcam WebSocket."""
        shared.camera_connected = True
        shared.update_frame(frame)
        try:
            self.frame_queue.put_nowait(frame)
        except queue.Full:
            try:
                self.frame_queue.get_nowait()
            except queue.Empty:
                pass
            self.frame_queue.put_nowait(frame)

    def get_frame(self):

        if self.cap is None and not self.browser_source:
            time.sleep(0.2)
            return None

        try:
            return self.frame_queue.get(timeout=1)

        except queue.Empty:
            return None

    def release(self):

        shared.running = False

        shared.camera_connected = False

        if self.cap is not None:
            self.cap.release()
