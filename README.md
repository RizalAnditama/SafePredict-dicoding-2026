# SafePredict

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Status](https://img.shields.io/badge/status-prototype-orange.svg)](#)

SafePredict — Predictive workplace safety for manufacturing. Real-time camera + tabular scoring to surface operational risk and near-misses.

## TL;DR
SafePredict scores operational risk per shift using camera-derived signals and simple tabular heuristics so supervisors can proactively mitigate incidents.

## Table of Contents
- Repository layout
- Quick overview
- Prerequisites
- Installation
- Usage
- Features
- Configuration
- Testing
- Troubleshooting
- Contributing
- License
- Maintainers & Contact
- Acknowledgements
- Links

## Repository layout
- `backend/` — FastAPI app, models, services
- `frontend/` — Next.js dashboard (TypeScript)
- `docs/` — implementation notes, workplan, backlog

See also: `SafePredict_Project_Workplan.md`

## Quick overview
- Backend: FastAPI + Uvicorn (Python)
- Frontend: Next.js (React, TypeScript)
- Planned ML: YOLOv8 for PPE detection; scikit-learn / XGBoost for tabular risk scoring

## Prerequisites (Windows / Dev)
- Python 3.10+ (`py -3`)
- Node.js 16+ and `npm`
- Git (optional)

## Installation

From repository root (backend):

```powershell
py -3 -m pip install --upgrade pip
py -3 -m pip install -r backend\requirements.txt
```

From repository root (frontend):

```powershell
cd frontend
npm install
```

## Usage

## Free deployment (so it’s visible on the internet)

This repo is split into two apps:

- Backend: FastAPI (Python)
- Frontend: Next.js (Node)

The easiest free setup is:

- Deploy **backend** on **Render (Free)**
- Deploy **frontend** on **Vercel (Free)** and point it at the Render URL

### 1) Deploy the backend to Render (Free)

1. Push this repository to your GitHub account.
2. Go to Render → **New** → **Blueprint**.
3. Select your repo. Render will detect `backend/render.yaml` and create the service.
4. After it finishes, copy your backend URL (it looks like `https://<name>.onrender.com`).

Optional: in Render → service → **Environment**, you can set:

- `LOG_LEVEL` (e.g. `INFO`)

### 2) Deploy the frontend to Vercel (Free)

1. Go to Vercel → **New Project** → import your repo.
2. Set **Root Directory** to `frontend/`.
3. In Vercel → Project → **Settings** → **Environment Variables**, add:

- `BACKEND_API_BASE_URL` = your Render backend URL (e.g. `https://<name>.onrender.com`)

4. Deploy.

Vercel will use `frontend/vercel.json` to rewrite `/api/*` calls to your backend.

### Notes / limitations

- Render Free can “sleep” after inactivity (first request may be slower).
- The webcam/camera endpoints require browser permission and may not work if you try to access a local camera from a remote hosted site depending on your browser/device policy.

Start the backend (from repo root):

```powershell
py -3 -m uvicorn backend.app.main:app --reload --port 8000
```

Start the frontend (from `frontend/`):

```powershell
cd frontend
npm run dev
```

The dashboard proxies the webcam stream and fetches a sample risk score from the backend at `/api/risk/score`.

### Example: quick runtime validation

```powershell
py -3 -c "from backend.app.main import app; print(app.title); from backend.app.services.risk_service import build_risk_response; from backend.app.models.schemas import RiskScoreRequest; from datetime import date; payload = RiskScoreRequest(area_id='press-line-1', shift_name='night', operator_hours=10, days_since_maintenance=4, violation_count_7d=5, near_miss_count_7d=3, shift_date=date.today()); print(build_risk_response(payload).model_dump())"
```

## Features
- Real-time webcam bridge (MJPEG) proxied through the backend
- Simple tabular risk scoring service for shift-level alerts
- Next.js dashboard with sample risk feed and camera panel

## Configuration

Runtime settings are loaded from environment variables or a `.env` file. See `backend/app/core/config.py` for documented keys. Example values are provided in `.env.example`.

Key env vars (from `.env.example`):
- `BACKEND_API_BASE_URL` — URL used by the frontend to call backend APIs (default `http://127.0.0.1:8000`)
- `BACKEND_HOST`, `BACKEND_PORT` — backend listening host and port
- `LOG_LEVEL` — logging verbosity

## Testing

Backend unit tests are located in `backend/tests` and can be run with:

```powershell
py -3 -m unittest discover -s backend/tests -p "test_*.py"
```

Add or update tests when changing behavior in `backend/app/services`.

## Troubleshooting

- `ModuleNotFoundError: No module named 'fastapi'` — run `py -3 -m pip install -r backend\requirements.txt` and use `py -3 -m uvicorn` to run the app.
- `ModuleNotFoundError: No module named 'app'` — ensure you run commands from the repository root and use import paths like `backend.app...`.
- Binary wheels failing on Windows (e.g., `xgboost`) — prefer Conda/wheels or run in CI/devcontainer.

## Contributing

Please read `CONTRIBUTING.md` for details on the workflow and local checks. Small, tested changes are preferred. Add tests for changed behavior and reference issues in PRs.

## License

This project is available under the MIT License. See `LICENSE`.

## Maintainers & Contact

- Maintainers: SafePredict contributors
- Primary contact: open an issue in this repository for questions or support

## Acknowledgements

- Initial scaffolding and design provided during the hackathon
- Open-source libraries used: FastAPI, Next.js, scikit-learn, XGBoost

## Links

- Workplan: `SafePredict_Project_Workplan.md`
- Docs: `docs/`

---

### README quality checklist

See `README_CHECKLIST.md` for a short QA checklist to validate this file before release.
