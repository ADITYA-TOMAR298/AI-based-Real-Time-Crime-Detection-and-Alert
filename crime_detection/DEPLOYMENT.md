# Deployment

## Architecture

- **Frontend:** Vercel, with `crime-detection-frontend` selected as the Root Directory.
- **Backend/model:** Google Cloud Run using the root `Dockerfile`. The tracked `models/` directory is copied into the image.
- **Database and uploads:** Cloud Run disk is temporary. For a real deployment, set `DATABASE_URL` to managed PostgreSQL and store snapshots/photos in Cloud Storage. SQLite and local folders are only suitable for a local demo.

## Vercel

1. Import the GitHub repository in Vercel and set Root Directory to `crime_detection/crime-detection-frontend`.
2. Add `VITE_API_URL` for Production and Preview, with the HTTPS Cloud Run service URL.
3. Deploy. `vercel.json` keeps React Router links working after a direct refresh.

## Cloud Run

1. In Google Cloud, enable Cloud Run and Artifact Registry APIs, then deploy from this repository folder:

   ```powershell
   gcloud run deploy crime-detection-api --source . --region YOUR_REGION --allow-unauthenticated --port 8080 --memory 4Gi --cpu 2 --set-env-vars "CORS_ORIGINS=https://YOUR-PROJECT.vercel.app,PIPELINE_ENABLED=false"
   ```

2. Copy the resulting service URL into Vercel as `VITE_API_URL`, then redeploy Vercel. The backend derives its own public URL from the incoming Cloud Run request; `PUBLIC_API_URL` is optional.
3. To enable live CCTV detection, redeploy with a publicly reachable RTSP source and `PIPELINE_ENABLED=true`.
4. To use the dashboard user's webcam instead, redeploy with `CAMERA_SOURCE=browser`, `PIPELINE_ENABLED=true`, `--timeout 3600`, `--concurrency 8`, and `--max-instances 1`. The dashboard asks for browser camera permission and sends JPEG frames over a reconnecting WebSocket. The browser must remain open; Cloud Run WebSocket connections time out after at most 60 minutes and reconnect automatically. The single-instance limit keeps webcam frames and the in-memory model pipeline together.

## Cost reality

Cloud Run has monthly free-tier allowances, but continuous video inference with a PyTorch model consumes CPU and memory continuously and will exceed them. Google’s $300 new-customer credit is a trial, not a one-year free host. Set billing alerts and a budget before enabling the pipeline.
