# Quick Render Setup with render.yaml

I've created a `render.yaml` file that will automatically configure both your backend and frontend services!

## Option 1: Use Blueprint (EASIEST - Automatic Setup)

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository: `Harryphied/Storage`
4. Render will automatically detect the `render.yaml` file
5. You'll be prompted to add the **SUPABASE_API_KEY** environment variable
6. Click **"Apply"**
7. **Done!** Both services will be deployed automatically with correct Root Directory settings

## Option 2: Manual Setup (if Blueprint doesn't work)

### Backend:
1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `Harryphied/Storage`
4. **IMPORTANT:** In the setup form, find "Root Directory" field and enter: `backend`
5. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variable:
   - `SUPABASE_API_KEY`: your_actual_api_key
   - `SUPABASE_STORAGE_URL`: `https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3`
7. Click "Create Web Service"

### Frontend:
1. Click **"New +"** → **"Static Site"**
2. Connect repository: `Harryphied/Storage`
3. **IMPORTANT:** Set Root Directory to: `frontend`
4. Set:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
5. Add environment variable:
   - `VITE_API_URL`: (your backend URL from above)
6. Click "Create Static Site"

## If You Already Created a Service with Error:

### To Fix Existing Service:
1. Go to your service in Render
2. Click **"Settings"** (left sidebar)
3. Look for **"Root Directory"** under "Build & Deploy" section
4. Change it from blank/`/` to: `backend` (for backend service)
5. Scroll down and click **"Save Changes"**
6. Render will automatically redeploy

## Why This Happens:

Render looks for `package.json` in the root by default, but your project structure is:
```
Storage/
├── backend/
│   └── package.json  ← Backend package.json is here
├── frontend/
│   └── package.json  ← Frontend package.json is here
└── render.yaml       ← Configuration file
```

The `render.yaml` file or Root Directory setting tells Render where to find the right `package.json`.

## Need Help?

If you're still stuck, you can:
1. Delete the existing service in Render
2. Use the Blueprint option (Option 1) - it's automatic!
3. The Blueprint will read `render.yaml` and set everything up correctly

The key is: **Root Directory must be set to `backend` or `frontend`** depending on which service you're deploying!

