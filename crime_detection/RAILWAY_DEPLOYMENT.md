# Railway deployment

1. In Railway, create a new project and select **Deploy from GitHub repo**.
2. Select this repository.
3. In the service settings set **Root Directory** to `crime_detection`.
4. Railway uses the included `Dockerfile` and `railway.toml` automatically.
5. Add these service variables before the first deployment:

   ```text
   CAMERA_SOURCE=disabled
   PIPELINE_ENABLED=false
   DATA_DIR=/tmp/crime_detection
   CORS_ORIGINS=*
   ```

6. Deploy and open `/health` on the generated Railway URL. It should return
   `{"status":"healthy"}`.
7. Deploy the frontend on Vercel with `VITE_API_URL` set to the Railway URL.
8. Replace `CORS_ORIGINS=*` with the exact Vercel production URL, then redeploy
   the Railway service.

Railway's trial/free resources are suitable for API testing and a small demo.
They are not sufficient for continuously running the PyTorch camera pipeline.
