---
title: Crime Detection API
emoji: "🛡️"
colorFrom: red
colorTo: gray
---

# Crime Detection API

FastAPI backend for the Crime Detection dashboard. It is configured for a
Docker-based deployment on Railway.

## Health check

Open `/health` after the Railway deployment reaches **Success**. It should return:

```json
{"status":"healthy"}
```

## Required Railway variables

Set `CORS_ORIGINS` to the URL of the Vercel frontend after it has been deployed.
For the first backend deployment only, `*` is acceptable; replace it with the Vercel
URL before sharing the application publicly.

`PIPELINE_ENABLED=false` is recommended for the initial deployment and basic
API testing. Enable it only when a browser webcam or publicly reachable RTSP
camera has been configured.

See `RAILWAY_DEPLOYMENT.md` for the complete deployment procedure.
