# Deploy As Single Vercel Project

This repository is configured for a single Vercel project deployment:
- Frontend: Next.js app in `frontend`
- Backend: Express app exposed as Vercel serverless function via `api/[...route].ts`

## 1. Push to GitHub

Push this repository to GitHub (or GitLab/Bitbucket).

## 2. Create Vercel Project

1. Go to Vercel Dashboard.
2. Click **Add New Project** and import this repository.
3. Keep the project root as repository root (do not set root to `frontend`).
4. Vercel will use `vercel.json` from the root automatically.

## 3. Add Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `DATABASE_URL` (production DB)
- `JWT_SECRET`
- `CLIENT_ORIGIN` (your deployed Vercel URL, e.g. `https://your-app.vercel.app`)
- `NEXT_PUBLIC_SERVER_BASE_URL` = `/api`

Optional:
- `NODE_ENV` = `production`

## 4. Automatic Deployments

In Vercel Project Settings -> Git:

- Enable auto-deploy for Production Branch (usually `main`).
- Enable Preview Deployments for pull requests.

After this, every push to `main` deploys automatically.

## 5. Notes

- API routes are available under `/api/*`.
- Frontend calls use `/api` by default via `frontend/src/lib/api/client.ts`.
- Prisma client generation is included in root build script.
