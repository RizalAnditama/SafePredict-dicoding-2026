from pydantic import BaseModel, Field


class CameraResolution(BaseModel):
    width: int = Field(..., ge=1)
    height: int = Field(..., ge=1)


class CameraStatusResponse(BaseModel):
    running: bool
    camera_index: int = Field(..., ge=0)
    resolution: CameraResolution
    quality: int = Field(..., ge=1, le=100)
    has_frame: bool
    last_error: str | None = None


class CameraModelInfo(BaseModel):
    name: str
    version: str
    input_type: str
    output_type: str
    notes: list[str]
