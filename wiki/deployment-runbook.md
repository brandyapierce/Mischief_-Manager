---
title: "Mischief Manager - Deployment Runbook"
generated_at: "2026-09-09"
status: "active"
---

# Deployment Runbook

This runbook covers the hosted Vercel deployment for the React/Vite frontend and the common setup failures encountered during the management-demo deployment.

## App location

The repository contains the frontend app in:

```text
frontend/
```

The deployable frontend is not at the repository root.

## Recommended Vercel configuration

In the Vercel project settings under **Build and Deployment**, use:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

The Root Directory must be set to `frontend` before saving the settings. If the Save button is disabled, turn off the optional settings for including files outside the root directory and skipping deployments when there are no root-directory changes.

Do not use `cd frontend` in any command when Root Directory is `frontend`. Vercel runs commands from that directory, so `cd frontend && npm install` attempts to enter a second, nonexistent `frontend/frontend` directory.

## Alternate repository-root configuration

If Vercel does not allow Root Directory to be set, use this equivalent configuration instead:

| Setting | Value |
| --- | --- |
| Root Directory | leave empty |
| Build Command | `cd frontend && npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `cd frontend && npm install` |

Use one configuration path or the other. Do not combine Root Directory `frontend` with commands that start with `cd frontend`.

## Deploying from the Vercel dashboard

1. Open the `mischief-manager` project in Vercel.
2. Open **Settings** → **Build and Deployment**.
3. Set the Root Directory and commands using the recommended configuration above.
4. Save the settings.
5. Open **Deployments**.
6. Redeploy the latest commit from branch `karpathy-llm-wiki-setup`.
7. Open the deployment's **Visit** URL.

The optional Vercel Coding Agent Plugin is not required for deployment.

## Local verification before redeploying

From the repository root:

```bash
cd frontend
npm install
npm run build
```

A successful build should produce:

```text
frontend/dist/index.html
frontend/dist/assets/
```

The frontend uses Vite and has these scripts:

```text
npm run dev
npm run build
npm run preview
```

## Common errors

### `Command "cd frontend && npm install" exited with 1`

This normally means Root Directory is already set to `frontend`. Change Install Command to `npm install` and remove `cd frontend` from Build Command as well.

### `The deployment failed because of a project or build error`

This is only Vercel's summary. Open the failed deployment's **Build Logs** and inspect the first red error. Verify the root-directory configuration before changing application code.

### The project URL returns `404 NOT_FOUND`

A Vercel project can exist while no successful deployment is attached to its domain. Check the deployment status and redeploy after correcting the Root Directory and commands.

### The hosted page is blank or fails on a phone

Check that `/assets/*.js` returns JavaScript, not `index.html`. The repository's `frontend/vercel.json` excludes `/assets` from the SPA fallback so Vercel can serve the built JavaScript and CSS files correctly.

If the HTML and JavaScript asset both load correctly but the page is still white on multiple devices, inspect the browser console for a client-side runtime error. Clear site data only rules out stale browser state; it does not fix a runtime exception. The app now normalizes incomplete localStorage state on startup, so redeploy the commit containing that fix before continuing diagnosis.

### `/signin` does not load directly

The app uses React Router and requires the SPA rewrite in `frontend/vercel.json`. Redeploy after confirming that file is included in the `frontend` Root Directory.

## Demo behavior and limitations

The hosted app is a frontend proof of concept. App state is stored in each browser's localStorage, so phones and computers do not share task state. The QR code opens `/signin`; it is a demo entry point, not secure authentication.

A production deployment still needs a backend/database, cross-device synchronization, server-enforced authorization, audit history, and real authentication.
