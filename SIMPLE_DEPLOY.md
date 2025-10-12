# SIMPLE RENDER DEPLOYMENT

## The Problem You Had:
Render couldn't find `package.json` because it was in a `backend/` folder.

## The Solution:
Backend files are now in the **root directory**. No configuration needed!

---

## 🚀 Deploy Backend (2 Minutes)

1. **Go to Render**: https://dashboard.render.com/

2. **Click "New +" → "Web Service"**

3. **Connect Repository**: `Harryphied/Storage`

4. **Leave everything default**, just fill in:
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Click "Advanced"** and add these environment variables:
   ```
   SUPABASE_API_KEY = your_actual_api_key
   SUPABASE_STORAGE_URL = https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
   ```

6. **Click "Create Web Service"**

7. ✅ **Done!** Copy the URL (e.g., `https://your-app.onrender.com`)

---

## 🎨 Deploy Frontend (2 Minutes)

1. **Click "New +" → "Static Site"**

2. **Connect Repository**: `Harryphied/Storage`

3. **Set these fields**:
   - **Root Directory**: `frontend` ⚠️ (this is important)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add environment variable**:
   ```
   VITE_API_URL = https://your-backend-url-from-step-7-above.onrender.com
   ```

5. **Click "Create Static Site"**

6. ✅ **Done!**

---

## That's It!

Now the backend `package.json` is in the root, so Render finds it automatically. The frontend stays in the `frontend/` folder so you just set Root Directory to `frontend`.

**No more ENOENT errors!** 🎉

