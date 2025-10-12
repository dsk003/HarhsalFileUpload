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
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account with storage bucket
- Supabase API key

### Installation

**1. Set up the backend:**

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

**2. Set up the frontend:**

```bash
cd frontend
npm install
```

### Running Locally

**Start the backend server:**

```bash
cd backend
npm start
```

**Start the frontend development server:**

```bash
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## Deployment to Render

### Backend Deployment

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Create a new Web Service
4. Connect your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `SUPABASE_API_KEY`: Your Supabase API key
   - `SUPABASE_STORAGE_URL`: `https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3`

### Frontend Deployment

1. Create a new Static Site in Render
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL`: Your backend URL from Render

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Storage and create a bucket called "uploads"
3. Get your API key from Settings > API
4. Use the service_role key for backend operations

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

## Technologies Used

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express, Multer
- **Storage**: Supabase Storage

## License

ISC

