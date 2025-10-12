# File Upload App

Upload any file to Supabase storage with a beautiful drag-and-drop interface.

## 🚀 Deploy to Render (SUPER SIMPLE)

### Backend (This Repository):
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect this repository: `Harryphied/Storage`
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - **SUPABASE_API_KEY**: `your_api_key_here`
   - **SUPABASE_STORAGE_URL**: `https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3`
6. Click **"Create Web Service"**
7. ✅ Done! Copy your backend URL

### Frontend (Separate Deployment):
1. Click **"New +"** → **"Static Site"**
2. Connect this repository: `Harryphied/Storage`
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - **VITE_API_URL**: `your_backend_url_from_above`
5. Click **"Create Static Site"**
6. ✅ Done!

## 📁 Project Structure

```
Storage/
├── server.js              # Backend server (in root)
├── package.json           # Backend dependencies
├── .env.example          # Environment variables template
└── frontend/             # React frontend
    ├── src/
    └── package.json
```

## 🔧 Run Locally

**Backend:**
```bash
npm install
# Create .env file with SUPABASE_API_KEY
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_API_KEY=your_supabase_api_key
SUPABASE_STORAGE_URL=https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
PORT=3001
```

## 📖 API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload a file (multipart/form-data)

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

## License

ISC
