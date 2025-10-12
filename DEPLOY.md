# 🚀 Deploy to Render (ONE Web Service)

## Simple 5-Minute Deployment

### Step-by-Step:

1. **Go to**: https://dashboard.render.com/

2. **Click**: "New +" → "Web Service"

3. **Connect**: Your repository `Harryphied/Storage`

4. **Settings**:
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

5. **Environment Variables** (Click "Advanced"):
   ```
   SUPABASE_API_KEY = your_actual_supabase_api_key_here
   SUPABASE_STORAGE_URL = https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
   ```

6. **Click**: "Create Web Service"

7. **Wait 3-5 minutes** for build to complete

8. **✅ Done!** Visit your Render URL to see the upload interface!

---

## What This Does:

1. **`npm install`** - Installs backend dependencies
2. **`npm run build`** - Installs frontend dependencies AND builds React app
3. **`npm start`** - Starts the Express server which serves both API and UI

---

## If You're Updating:

If you already have a Web Service running:

1. Go to your service → **Settings**
2. Change **Build Command** to: `npm install && npm run build`
3. Click **"Save Changes"**
4. Click **"Manual Deploy"** → **"Deploy latest commit"**
5. Wait for deployment to finish

---

## Troubleshooting:

### Still seeing JSON instead of UI?
- Check the "Logs" tab in Render
- Look for "✅ Serving frontend from:" message
- If you see "⚠️ Frontend dist folder not found", the build didn't complete
- Try redeploying with the correct build command

### Build fails?
- Make sure environment variables are set
- Check that both backend and frontend package.json files exist in your repo

### Takes too long?
- First build takes 3-5 minutes (frontend needs to compile)
- Subsequent deploys are faster

---

## That's It!

**One service, one URL, one deployment!** 🎉
