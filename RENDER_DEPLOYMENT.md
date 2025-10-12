# Render Deployment Guide

## Important: Root Directory Configuration

Your project has separate `backend` and `frontend` directories. You need to deploy them as **two separate services** on Render.

## Backend Deployment (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Harryphied/Storage`
4. Configure the service:

   **CRITICAL: Set Root Directory**
   - **Name**: `file-upload-backend` (or any name you prefer)
   - **Root Directory**: `backend` ⚠️ **THIS IS REQUIRED**
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   - Click "Advanced" or go to Environment tab
   - Add the following variables:
     - **Key**: `SUPABASE_API_KEY`  
       **Value**: `your_actual_supabase_api_key_here`
     - **Key**: `SUPABASE_STORAGE_URL`  
       **Value**: `https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3`

6. Click **"Create Web Service"**

7. **Copy the backend URL** (e.g., `https://file-upload-backend.onrender.com`)

## Frontend Deployment (Static Site)

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `Harryphied/Storage`
3. Configure the service:

   **CRITICAL: Set Root Directory**
   - **Name**: `file-upload-frontend` (or any name you prefer)
   - **Root Directory**: `frontend` ⚠️ **THIS IS REQUIRED**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   - Click "Advanced" or go to Environment tab
   - Add:
     - **Key**: `VITE_API_URL`  
       **Value**: `https://your-backend-url.onrender.com` (use the URL from step 7 above)

5. Click **"Create Static Site"**

## Troubleshooting

### Error: "Could not read package.json"
**Cause**: Root Directory is not set correctly.  
**Solution**: Edit your service and set Root Directory to `backend` or `frontend`

### CORS Errors
**Cause**: Frontend can't connect to backend.  
**Solution**: Verify `VITE_API_URL` in frontend settings matches your backend URL.

### "Supabase API key not configured"
**Cause**: Environment variable is missing or incorrect.  
**Solution**: Check that `SUPABASE_API_KEY` is set in backend's Environment Variables.

## Verifying Deployment

### Backend Check:
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Frontend Check:
Visit: `https://your-frontend-url.onrender.com`

You should see the File Upload Center interface.

## Important Notes

- ⚠️ **Always set the Root Directory** when deploying
- Backend must be deployed first to get the URL for frontend
- Free tier services may spin down after inactivity (takes 50s to wake up)
- Keep your Supabase API key secure in environment variables

