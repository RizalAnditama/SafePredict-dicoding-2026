from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..models.camera import CameraModelInfo, CameraStatusResponse
from ..models.schemas import RiskScoreRequest, RiskScoreResponse, ShiftPayload
from ..services.webcam_bridge import get_webcam_bridge
from ..services.risk_service import build_risk_response

router = APIRouter()


@router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/shift", response_model=ShiftPayload)
def create_shift(payload: ShiftPayload) -> ShiftPayload:
    return payload


@router.post("/risk/score", response_model=RiskScoreResponse)
def score_risk(payload: RiskScoreRequest) -> RiskScoreResponse:
    return build_risk_response(payload)


@router.get("/camera/model", response_model=CameraModelInfo)
def camera_model() -> CameraModelInfo:
    return CameraModelInfo(
        name="Webcam bridge model",
        version="v1.0",
        input_type="local webcam frames",
        output_type="MJPEG stream",
        notes=[
            "This is the camera bridge model layer for the MVP.",
            "It exposes the laptop webcam to the dashboard through the backend.",
        ],
    )


@router.get("/camera/status", response_model=CameraStatusResponse)
def camera_status() -> CameraStatusResponse:
    bridge = get_webcam_bridge()
    return bridge.status()


@router.get("/camera/stream")
def camera_stream() -> StreamingResponse:
    bridge = get_webcam_bridge()

    if not bridge.ensure_started():
      raise HTTPException(status_code=503, detail="Webcam bridge could not be started")

    return StreamingResponse(
        bridge.mjpeg_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
