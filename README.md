# File Upload App

Upload any file to Supabase storage with a beautiful drag-and-drop interface. **Everything runs as a single Web Service!**

## 🚀 Deploy to Render (ONE Web Service)

1. **Go to Render**: https://dashboard.render.com/

2. **Click "New +"** → **"Web Service"**

3. **Connect Repository**: `Harryphied/Storage`

4. **Configure**:
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `npm start`

5. **Add Environment Variables**:
   - `SUPABASE_API_KEY` = your_supabase_api_key
   - `SUPABASE_STORAGE_URL` = `https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3`

6. **Click "Create Web Service"**

7. ✅ **Done!** Visit your URL to see the upload UI!

---

## 📁 How It Works

- Backend serves the React frontend from `/frontend/dist`
- API endpoints at `/api/*`
- Everything runs on ONE service, ONE URL!

## 🔧 Run Locally

**First time setup:**
```bash
# Install backend
npm install

# Install and build frontend
npm run build
```

**Start the server:**
```bash
npm start
```

Visit `http://localhost:3001`

## ⚙️ Environment Variables

Create a `.env` file:

```env
SUPABASE_API_KEY=your_supabase_api_key
SUPABASE_STORAGE_URL=https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
PORT=3001
```

## 📖 API Endpoints

- `GET /` - Serves the React UI
- `GET /api/health` - Health check
- `POST /api/upload` - Upload a file

## 🔑 Get Supabase API Key

1. Go to https://supabase.com
2. Create/open your project
3. Go to **Storage** → Create bucket "uploads"
4. Go to **Settings** → **API** 
5. Copy the **service_role** key

## Technologies

- **Backend**: Node.js, Express, Multer
- **Frontend**: React, Vite
- **Storage**: Supabase
- **Deployment**: Single Render Web Service

## License

ISC
