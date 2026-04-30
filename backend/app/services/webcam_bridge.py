from __future__ import annotations

import atexit
import threading
import time
from dataclasses import dataclass, field
from typing import Optional

from ..models.camera import CameraResolution, CameraStatusResponse

try:
    import cv2
except ImportError as exc:  # pragma: no cover - handled at runtime
    cv2 = None  # type: ignore[assignment]
    _CV2_IMPORT_ERROR = exc
else:
    _CV2_IMPORT_ERROR = None


@dataclass
class WebcamBridge:
    camera_index: int = 0
    width: int = 1280
    height: int = 720
    quality: int = 80
    capture: Optional[object] = field(default=None, init=False)
    latest_frame: Optional[bytes] = field(default=None, init=False)
    is_running: bool = field(default=False, init=False)
    last_error: Optional[str] = field(default=None, init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)
    _condition: threading.Condition = field(init=False)
    _thread: Optional[threading.Thread] = field(default=None, init=False)

    def __post_init__(self) -> None:
        self._condition = threading.Condition(self._lock)
        atexit.register(self.stop)

    def ensure_started(self) -> bool:
        if self.is_running:
            return True

        if cv2 is None:
            self.last_error = f"OpenCV is unavailable: {_CV2_IMPORT_ERROR}"
            return False

        backend_candidates = []
        for backend_name in ("CAP_DSHOW", "CAP_MSMF", "CAP_ANY"):
            backend_value = getattr(cv2, backend_name, None)
            if backend_value is not None:
                backend_candidates.append((backend_name, backend_value))

        if not backend_candidates:
            backend_candidates.append(("default", None))

        capture = None
        attempted_backends: list[str] = []
        for backend_name, backend_value in backend_candidates:
            attempted_backends.append(backend_name)
            capture = cv2.VideoCapture(self.camera_index) if backend_value is None else cv2.VideoCapture(self.camera_index, backend_value)
            if capture.isOpened():
                break
            capture.release()
            capture = None

        if capture is None or not capture.isOpened():
            self.last_error = (
                f"Could not open webcam index {self.camera_index} using backends: "
                + ", ".join(attempted_backends)
            )
            return False

        capture.set(cv2.CAP_PROP_FRAME_WIDTH, float(self.width))
        capture.set(cv2.CAP_PROP_FRAME_HEIGHT, float(self.height))

        self.capture = capture
        self.is_running = True
        self.last_error = None
        self._thread = threading.Thread(target=self._reader_loop, daemon=True)
        self._thread.start()
        return True

    def stop(self) -> None:
        with self._lock:
            self.is_running = False
            capture = self.capture
            self.capture = None
            self._condition.notify_all()

        if capture is not None:
            capture.release()

    def status(self) -> CameraStatusResponse:
        return CameraStatusResponse(
            running=self.is_running,
            camera_index=self.camera_index,
            resolution=CameraResolution(width=self.width, height=self.height),
            quality=self.quality,
            has_frame=self.latest_frame is not None,
            last_error=self.last_error,
        )

    def mjpeg_frames(self):
        while True:
            if not self.ensure_started():
                raise RuntimeError(self.last_error or "Webcam bridge failed to start")

            with self._condition:
                if self.latest_frame is None:
                    self._condition.wait(timeout=0.2)
                    continue
                frame = self.latest_frame

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            )

    def _reader_loop(self) -> None:
        assert cv2 is not None

        while self.is_running:
            capture = self.capture
            if capture is None:
                time.sleep(0.05)
                continue

            ok, frame = capture.read()
            if not ok:
                self.last_error = "Failed to read frame from webcam"
                time.sleep(0.05)
                continue

            success, encoded = cv2.imencode(
                ".jpg",
                frame,
                [cv2.IMWRITE_JPEG_QUALITY, self.quality],
            )
            if not success:
                self.last_error = "Failed to encode webcam frame"
                continue

            with self._condition:
                self.latest_frame = encoded.tobytes()
                self._condition.notify_all()


_bridge = WebcamBridge()


def get_webcam_bridge() -> WebcamBridge:
    return _bridge