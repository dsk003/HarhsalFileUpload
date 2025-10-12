# File Upload Center

A modern full-stack web application for uploading files to Supabase storage. Built with React, Express, and Supabase.

## Features

- 🎨 Beautiful UI with drag-and-drop support
- 📁 Upload images, videos, PDFs, documents, and more
- ☁️ Secure file storage using Supabase
- 📊 Real-time upload progress tracking
- 🚀 Ready for deployment on Render

## Project Structure

```
Storage/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/           # Express server
│   ├── server.js
│   └── package.json
│
├── README.md
└── RENDER_DEPLOYMENT.md    # Detailed deployment guide
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account with storage bucket
- Supabase API key

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/Harryphied/Storage.git
cd Storage
```

**2. Set up the backend:**

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
SUPABASE_API_KEY=your_supabase_api_key_here
SUPABASE_STORAGE_URL=https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3
PORT=3001
```

**3. Set up the frontend:**

```bash
cd ../frontend
npm install
```

### Running Locally

**Terminal 1 - Start the backend server:**

```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

**Terminal 2 - Start the frontend development server:**

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

Open your browser and navigate to `http://localhost:3000`

## Deployment to Render

⚠️ **IMPORTANT**: This project requires deploying TWO separate services on Render.

### Quick Steps:

1. **Deploy Backend** (Web Service)
   - Root Directory: **`backend`**
   - Build: `npm install`
   - Start: `npm start`
   - Add `SUPABASE_API_KEY` environment variable

2. **Deploy Frontend** (Static Site)
   - Root Directory: **`frontend`**
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Add `VITE_API_URL` environment variable (your backend URL)

📖 **See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed step-by-step instructions.**

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Storage** section
3. Create a new bucket called **"uploads"**
4. Set bucket permissions (public or private based on your needs)
5. Go to **Settings** → **API**
6. Copy your **service_role** key (keep it secret!)
7. Add the key to your environment variables

## API Endpoints

### POST /api/upload
Upload a file to Supabase storage.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filename": "1234567890_example.jpg",
  "originalName": "example.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg",
  "url": "https://..."
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Technologies Used

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express, Multer
- **Storage**: Supabase Storage
- **Deployment**: Render

## Troubleshooting

### "Could not read package.json" on Render
**Solution**: Make sure you set the **Root Directory** to `backend` or `frontend` in Render's service settings.

### CORS errors
**Solution**: Verify that `VITE_API_URL` in your frontend environment variables matches your backend URL.

### Upload fails with "API key not configured"
**Solution**: Check that `SUPABASE_API_KEY` is set in your backend's environment variables on Render.

## License

ISC

## Repository

[https://github.com/Harryphied/Storage](https://github.com/Harryphied/Storage)
