# File Upload App

A modern, full-stack web application for uploading files to Supabase Storage. Built with React, Vite, Node.js, and Express.

## Features

- 📤 **Drag & Drop Upload** - Intuitive file upload with drag-and-drop support
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📁 **Any File Type** - Upload images, videos, PDFs, documents, and more
- ☁️ **Supabase Storage** - Secure cloud storage integration
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 📊 **File Management** - View all uploaded files with metadata
- 🔄 **Real-time Updates** - File list updates automatically after uploads

## Tech Stack

### Frontend
- React 18
- Vite (for fast development and building)
- Axios (for HTTP requests)
- Modern CSS with animations

### Backend
- Node.js
- Express
- Supabase JS Client
- Multer (for file handling)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account with a storage bucket set up

## Supabase Setup

1. Go to [Supabase](https://supabase.com) and create an account (if you don't have one)
2. Create a new project
3. Navigate to **Storage** in the left sidebar
4. Create a new bucket called `uploads` (or any name you prefer)
5. Set the bucket to **Public** if you want files to be publicly accessible
6. Get your Supabase API Key:
   - Go to **Settings** → **API**
   - Copy the `anon` `public` key (or use the `service_role` key for server-side operations)

## Installation

1. Clone or download this repository

2. Install root dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

## Configuration

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:
```env
SUPABASE_URL=https://hfvezfqtlyegograuxqa.supabase.co
SUPABASE_KEY=your_actual_supabase_api_key
SUPABASE_BUCKET=uploads
PORT=3001
```

**Important:** Replace `your_actual_supabase_api_key` with your actual Supabase API key.

## Running the Application

### Development Mode

Run both the frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:3000`
- Backend API server on `http://localhost:3001`

The frontend is configured to proxy API requests to the backend automatically.

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The server will serve both the API and the built React app on `http://localhost:3001`.

## Deployment to Render

### Step 1: Prepare Your Repository

1. Initialize a git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Push to GitHub/GitLab/Bitbucket

### Step 2: Deploy to Render

1. Go to [Render](https://render.com) and sign up/login
2. Click **New +** and select **Web Service**
3. Connect your repository
4. Configure the service:
   - **Name:** Your app name (e.g., `file-upload-app`)
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free or paid tier

### Step 3: Add Environment Variables

In the Render dashboard, add the following environment variables:

- `SUPABASE_URL`: `https://hfvezfqtlyegograuxqa.supabase.co`
- `SUPABASE_KEY`: Your Supabase API key (from your Supabase dashboard)
- `SUPABASE_BUCKET`: `uploads` (or your bucket name)
- `PORT`: `3001`
- `NODE_ENV`: `production`

### Step 4: Deploy

Click **Create Web Service** and Render will automatically deploy your app!

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Upload File
```
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <file> }
```
Uploads a file to Supabase Storage.

### List Files
```
GET /api/files
```
Returns a list of all uploaded files with their metadata and URLs.

## File Size Limits

The default file size limit is 50MB. You can modify this in `server/index.js`:

```javascript
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Change this value
  }
});
```

## Project Structure

```
file-upload-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FileUpload.css
│   │   │   ├── FileList.jsx
│   │   │   └── FileList.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                # Node.js backend
│   └── index.js
├── .env                   # Environment variables (not in git)
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Troubleshooting

### "SUPABASE_URL and SUPABASE_KEY must be set"
Make sure you've created a `.env` file with your Supabase credentials.

### Upload fails with "Failed to upload file to storage"
- Check that your Supabase API key is correct
- Verify that the bucket name matches your Supabase bucket
- Ensure the bucket has the correct permissions (public or private)

### Files not appearing in the list
- Make sure the bucket name in `.env` matches your Supabase bucket
- Check that files were uploaded successfully
- Verify bucket permissions allow reading files

## Security Notes

- The `.env` file is excluded from git (via `.gitignore`)
- Never commit your API keys to version control
- Use environment variables for all sensitive data
- For production, consider using a service role key with appropriate RLS policies

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For issues related to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Render**: Check [Render Documentation](https://render.com/docs)
- **This app**: Open an issue in the repository
