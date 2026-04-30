from datetime import date, datetime

from pydantic import BaseModel, Field


class ShiftPayload(BaseModel):
    area_id: str = Field(..., examples=["press-line-1"])
    shift_name: str = Field(..., examples=["night"])
    start_time: datetime
    end_time: datetime
    operator_count: int = Field(..., ge=1)


class RiskScoreRequest(BaseModel):
    area_id: str = Field(..., examples=["press-line-1"])
    shift_name: str = Field(..., examples=["night"])
    operator_hours: float = Field(..., ge=0)
    days_since_maintenance: int = Field(..., ge=0)
    violation_count_7d: int = Field(..., ge=0)
    near_miss_count_7d: int = Field(..., ge=0)
    shift_date: date


class RiskScoreResponse(BaseModel):
    area_id: str
    risk_score: float = Field(..., ge=0, le=100)
    risk_band: str
    top_factors: list[str]
    recommendation: str
