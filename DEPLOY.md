# 🚀 Deploy to Render (Super Simple - ONE Service!)

## You only need ONE Web Service now! Everything runs together.

### Step-by-Step:

1. **Go to**: https://dashboard.render.com/

2. **Click**: "New +" → "Web Service"

3. **Connect**: Your repository `Harryphied/Storage`

4. **Settings**:
   ```
   Build Command: chmod +x build.sh && ./build.sh
   Start Command: npm start
   ```

5. **Environment Variables** (Click "Advanced"):
   ```
   SUPABASE_API_KEY = your_actual_supabase_api_key_here
   SUPABASE_STORAGE_URL = https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
   ```

6. **Click**: "Create Web Service"

7. **Wait 3-5 minutes** for build

8. **Done!** Visit your Render URL to see the upload interface!

---

## What Changed?

✅ **ONE service instead of two**  
✅ **Backend serves the React frontend**  
✅ **ONE URL for everything**  
✅ **Much simpler!**

---

## How It Works:

- Your Express server now serves the built React files
- API endpoints: `/api/upload`, `/api/health`
- Frontend UI: `/` (root and all other routes)
- Everything on the same domain, no CORS issues!

---

## If You Get Errors:

### "Build failed"
- Check that environment variables are set
- Make sure build script has execute permissions

### "Cannot find module"
- Render will install all dependencies automatically
- Just wait for the build to complete

### Still seeing JSON instead of UI?
- Wait a few minutes for Render to finish building
- Check the "Logs" tab in Render dashboard
- Make sure the build completed successfully

---

## That's It!

No more confusion about Root Directory or Static Sites. Just ONE Web Service! 🎉

