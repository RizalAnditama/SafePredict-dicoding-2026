from datetime import date
import unittest

from backend.app.models.schemas import RiskScoreRequest
from backend.app.services.risk_service import build_risk_response


class RiskServiceTests(unittest.TestCase):
    def make_payload(
        self,
        *,
        area_id: str = "press-line-1",
        shift_name: str = "day",
        operator_hours: float = 4,
        days_since_maintenance: int = 1,
        violation_count_7d: int = 0,
        near_miss_count_7d: int = 0,
    ) -> RiskScoreRequest:
        return RiskScoreRequest(
            area_id=area_id,
            shift_name=shift_name,
            operator_hours=operator_hours,
            days_since_maintenance=days_since_maintenance,
            violation_count_7d=violation_count_7d,
            near_miss_count_7d=near_miss_count_7d,
            shift_date=date(2026, 4, 30),
        )

    def test_low_risk_defaults_to_normal_monitoring(self) -> None:
        response = build_risk_response(self.make_payload())

        self.assertEqual(response.area_id, "press-line-1")
        self.assertEqual(response.risk_score, 20.0)
        self.assertEqual(response.risk_band, "low")
        self.assertEqual(response.top_factors, ["data operasional normal"])
        self.assertIn("Monitor rutin", response.recommendation)

    def test_medium_risk_includes_expected_factors(self) -> None:
        response = build_risk_response(
            self.make_payload(
                shift_name="night",
                operator_hours=10,
                days_since_maintenance=4,
            )
        )

        self.assertEqual(response.risk_score, 70.0)
        self.assertEqual(response.risk_band, "medium")
        self.assertIn("shift malam", response.top_factors)
        self.assertIn("durasi kerja tinggi", response.top_factors)
        self.assertIn("maintenance tertunda", response.top_factors)

    def test_high_risk_caps_at_hundred(self) -> None:
        response = build_risk_response(
            self.make_payload(
                shift_name="malam",
                operator_hours=12,
                days_since_maintenance=6,
                violation_count_7d=8,
                near_miss_count_7d=5,
            )
        )

        self.assertEqual(response.risk_score, 100.0)
        self.assertEqual(response.risk_band, "high")
        self.assertEqual(len(response.top_factors), 5)
        self.assertIn("Rotasi operator", response.recommendation)


if __name__ == "__main__":
    unittest.main()
