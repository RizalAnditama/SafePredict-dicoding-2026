#!/usr/bin/env python3
"""
Smoke test for SafePredict backend.

Checks performed:
1. Import `backend.app.main` and print the FastAPI app title
2. Call demo `build_risk_response` with sample payload and print result
3. Attempt HTTP GET to `http://127.0.0.1:8000/docs` and `/openapi.json` (server must be running separately)

Run:
    py -3 scripts\smoke_test.py

Exit codes:
 - 0 : import & demo call succeeded (HTTP checks are informational)
 - 2 : import or demo call failed
"""
import sys
import json
from datetime import date
from pathlib import Path

# Ensure repository root is on sys.path so `import backend...` works even when
# the script is executed from the `scripts/` folder.
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def main():
    ok = True
    # 1) import app
    try:
        from backend.app.main import app
        print("Imported app:", getattr(app, "title", "<no title>"))
    except Exception as e:
        print("ERROR importing backend.app.main:", e, file=sys.stderr)
        ok = False

    # 2) demo risk service
    try:
        from backend.app.services.risk_service import build_risk_response
        from backend.app.models.schemas import RiskScoreRequest

        payload = RiskScoreRequest(
            area_id="press-line-1",
            shift_name="night",
            operator_hours=10,
            days_since_maintenance=4,
            violation_count_7d=5,
            near_miss_count_7d=3,
            shift_date=date.today(),
        )
        resp = build_risk_response(payload)
        print("Demo risk response:\n", json.dumps(resp.model_dump(), indent=2, default=str))
    except Exception as e:
        print("ERROR running demo risk service:", e, file=sys.stderr)
        ok = False

    # 3) HTTP checks (informational)
    import urllib.request
    import urllib.error

    urls = [
        "http://127.0.0.1:8000/docs",
        "http://127.0.0.1:8000/openapi.json",
    ]
    for u in urls:
        try:
            with urllib.request.urlopen(u, timeout=3) as r:
                print(f"HTTP {u} -> {r.status}")
        except Exception as e:
            print(f"HTTP check failed for {u}: {e}", file=sys.stderr)

    if ok:
        print("SMOKE TEST: OK")
        sys.exit(0)
    else:
        print("SMOKE TEST: FAILED", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
