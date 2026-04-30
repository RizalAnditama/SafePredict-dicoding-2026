# Deployment guide — recommended student-pack-friendly setup

This document recommends a simple, low-cost deployment setup that works well with the GitHub Student Developer Pack and common free tiers.

Recommended combo
- Frontend: Vercel (free tier) — automatic GitHub integration for Next.js
- Backend: Azure App Service (use Azure for Students credits) — host FastAPI app
- Database / storage: MongoDB Atlas free tier (or Azure Cosmos DB free tier)

Why this combo
- Vercel handles Next.js builds and preview deployments automatically.
- Azure for Students gives credits and supports App Service deployment via GitHub Actions.
- MongoDB Atlas provides an easy, free sandbox DB for telemetry/events.

What I'll add to the repo
- A GitHub Actions workflow to build and deploy the backend to Azure App Service.
- A deployment doc with step-by-step instructions and required repo secrets.

Prerequisites
- An Azure subscription with Azure CLI access and permissions to create resources (or use the Azure Portal). For students, use **Azure for Students**.
- `az` CLI installed and authenticated locally.
- A GitHub repository for this project.
- A Vercel account connected to your GitHub repo for frontend (optional — Vercel also deploys automatically without extra workflow).

Create an Azure service principal (for GitHub Actions)
1. Authenticate locally: `az login`
2. Create a resource group and App Service plan / Web App (or create these in the portal). Example minimal commands:

```powershell
az group create -n safepredict-rg -l eastus
az webapp create --resource-group safepredict-rg --plan <your-plan-name> --name <your-webapp-name> --runtime "PYTHON|3.10"
```

3. Create a service principal with scoped access to the resource group and output JSON credentials for GitHub Secrets:

```powershell
az ad sp create-for-rbac --name "safepredict-gh-actions" --role contributor --scopes /subscriptions/<SUB_ID>/resourceGroups/safepredict-rg --sdk-auth
```

That command prints a JSON object. Copy it — you'll add it to the GitHub repo secret `AZURE_CREDENTIALS`.

Required GitHub repository secrets
- `AZURE_CREDENTIALS` — JSON value from `az ad sp create-for-rbac --sdk-auth` (used by `azure/login` action)
- `AZURE_WEBAPP_NAME` — the name of the App Service created
- `AZURE_RESOURCE_GROUP` — the resource group name (e.g., `safepredict-rg`)

How the GitHub Action works (overview)
- On push to `main` the workflow:
  - checks out code
  - sets up Python and installs backend deps
  - runs unit checks (if present)
  - deploys the backend code to the Azure Web App using `azure/webapps-deploy`

Frontend notes (Vercel)
- For the `frontend/` Next.js app we recommend connecting the GitHub repo to Vercel (https://vercel.com/new). Vercel will build and deploy each push automatically.
- If you prefer a GitHub Action-based deploy, Vercel exposes a `vercel-action` that can be used with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets.

Security notes
- Keep `AZURE_CREDENTIALS` secret — it grants the service principal access to your subscription/resource group.
- For production, restrict the service principal to only required resources and follow least-privilege practices.

Support and next steps
- I added a GitHub Actions workflow that shows one concrete Azure deployment flow. After you create the Azure resources and set GitHub secrets, pushing to `main` will deploy the backend.
- If you want, I can also add a `frontend` workflow (Vercel or GitHub Pages) or a containerized Docker-based deployment to Render/DO.
