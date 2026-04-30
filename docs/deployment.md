# Deployment guide — recommended student-pack-friendly setup

This document recommends a simple, low-cost deployment setup that works well with the GitHub Student Developer Pack and common free tiers.

Recommended combo
- Frontend: Vercel (free tier) — automatic GitHub integration for Next.js
- Backend: Render free web service — simple FastAPI hosting with `render.yaml`
- Database / storage: MongoDB Atlas free tier (or any other free managed service if needed later)

Why this combo
- Vercel handles Next.js builds and preview deployments automatically.
- Azure for Students gives credits and supports App Service deployment via GitHub Actions.
- MongoDB Atlas provides an easy, free sandbox DB for telemetry/events.

What this repo already has
- `backend/render.yaml` for one-click Render deployment.
- `frontend/app/api/camera/stream/route.ts` for proxying the webcam stream through the frontend.
- `frontend/vercel.json` was previously used for proxying, but it is not needed once the Next route handles the stream.

Prerequisites
- A GitHub repository for this project.
- A Render account connected to GitHub.
- A Vercel account connected to your GitHub repo for frontend.

### 1) Deploy the backend to Render (Free)

1. Push this repository to GitHub.
2. Go to Render and create a new **Blueprint** from the repo root.
3. Render will read `backend/render.yaml`, create the service, and build the app.
4. Copy the Render URL after deployment finishes, for example `https://<name>.onrender.com`.

### 2) Deploy the frontend to Vercel (Free)

1. Go to Vercel and import the same GitHub repo.
2. Set **Root Directory** to `frontend/`.
3. Add this environment variable in Vercel:

- `BACKEND_API_BASE_URL` = your Render backend URL

4. Deploy.

The frontend uses `frontend/app/api/camera/stream/route.ts` to proxy the webcam stream to the Render backend, so the browser can keep using `/api/camera/stream` on the same Vercel domain.

Security notes
- Keep `BACKEND_API_BASE_URL` pointing to your deployed backend, not a local address.
- Render free services can sleep after inactivity, so the first request may be slower.

Support and next steps
- If you want one domain for both apps, I can add a custom reverse-proxy setup next.
- If you want to keep everything on a single free provider, I can also convert the frontend to a static export and serve it differently.
