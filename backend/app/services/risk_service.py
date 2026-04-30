from ..models.schemas import RiskScoreRequest, RiskScoreResponse


def build_risk_response(payload: RiskScoreRequest) -> RiskScoreResponse:
    score = 20.0

    if payload.shift_name.lower() in {"night", "malam"}:
        score += 20.0
    if payload.operator_hours >= 10:
        score += 15.0
    if payload.days_since_maintenance >= 4:
        score += 15.0
    if payload.violation_count_7d >= 5:
        score += 15.0
    if payload.near_miss_count_7d >= 3:
        score += 15.0

    score = min(score, 100.0)

    if score >= 75:
        band = "high"
        recommendation = "Rotasi operator dan inspeksi area sebelum shift berikutnya."
    elif score >= 45:
        band = "medium"
        recommendation = "Tambahkan pengawasan dan review jadwal maintenance."
    else:
        band = "low"
        recommendation = "Monitor rutin dan lanjutkan operasi normal."

    factors = []
    if payload.shift_name.lower() in {"night", "malam"}:
        factors.append("shift malam")
    if payload.operator_hours >= 10:
        factors.append("durasi kerja tinggi")
    if payload.days_since_maintenance >= 4:
        factors.append("maintenance tertunda")
    if payload.violation_count_7d >= 5:
        factors.append("violation historis tinggi")
    if payload.near_miss_count_7d >= 3:
        factors.append("near-miss meningkat")

    return RiskScoreResponse(
        area_id=payload.area_id,
        risk_score=score,
        risk_band=band,
        top_factors=factors or ["data operasional normal"],
        recommendation=recommendation,
    )
