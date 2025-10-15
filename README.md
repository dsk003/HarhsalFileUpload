# File Upload App

A modern, full-stack web application for uploading files to Supabase Storage. Built with React, Vite, Node.js, and Express.

## Features

- 🔐 **Authentication** - Secure username/password login system
- 📤 **Drag & Drop Upload** - Intuitive file upload with drag-and-drop support
- 🎨 **Modern UI** - Beautiful, responsive design with smooth animations
- 📁 **Any File Type** - Upload images, videos, PDFs, documents, and more
- ☁️ **Supabase Storage** - Secure cloud storage integration
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 📊 **File Management** - View all uploaded files with metadata
- 🔄 **Real-time Updates** - File list updates automatically after uploads
- 🛡️ **Protected Routes** - All file operations require authentication
- 🏗️ **Clean Architecture** - Frontend is pure UI, all business logic in backend
- ✅ **Backend Validation** - All input validation and sanitization on server
- 🚀 **Single Build Command** - Optimized for Render deployment

## Tech Stack

### Frontend (Presentation Layer)
- React 18
- Vite (for fast development and building)
- Axios (for HTTP requests)
- Modern CSS with animations
- **No business logic** - Pure UI components

### Backend (Business Logic Layer)
- Node.js
- Express
- Supabase JS Client
- Multer (for file handling)
- **All validation and external API calls**

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account with a storage bucket set up

## Supabase Setup

### Authentication Setup

1. Go to [Supabase](https://supabase.com) and create an account (if you don't have one)
2. Create a new project
3. **Configure Authentication**:
   - Go to **Authentication** → **Providers**
   - Ensure **Email** provider is enabled
   - Go to **Authentication** → **Settings**
   - **Disable** "Enable email confirmations" or "Confirm email" (we use username@fileupload.app format)
4. Get your API Key:
   - Go to **Settings** → **API**
   - Copy the **`service_role` secret key** (REQUIRED for auth to work)
   - ⚠️ **Important**: Use service_role key, NOT the anon public key

### Storage Setup

1. Navigate to **Storage** in the left sidebar
2. Create a new bucket called `uploads` (or any name you prefer)
3. Set the bucket to **Public** if you want files to be publicly accessible
4. Set bucket policies (see SUPABASE_SETUP.md for detailed instructions)

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
SUPABASE_KEY=your_actual_supabase_service_role_key
SUPABASE_BUCKET=uploads
PORT=3001
```

**Important:** 
- Replace `your_actual_supabase_service_role_key` with your **service_role** key from Supabase
- ⚠️ **Must use service_role key**, not anon public key, for authentication to work
- Get it from: Supabase Dashboard → Settings → API → service_role key

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

**First Time Usage:**
1. Open `http://localhost:3000` in your browser
2. You'll see a login form
3. Click "Sign up" to create an account
4. Enter a username and password (min 6 characters)
5. You'll be logged in automatically
6. Start uploading files!

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
- `SUPABASE_KEY`: Your Supabase **service_role** key (⚠️ NOT anon key)
- `SUPABASE_BUCKET`: `uploads` (or your bucket name)
- `PORT`: `3001`
- `NODE_ENV`: `production`

**Important**: Must use service_role key for authentication to work!

### Step 4: Deploy

Click **Create Web Service** and Render will automatically deploy your app!

## API Endpoints

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

Body: { username: string, password: string }
```
Creates a new user account.

#### Login
```
POST /api/auth/login
Content-Type: application/json

Body: { username: string, password: string }
```
Authenticates user and returns JWT token.

#### Verify Session
```
GET /api/auth/verify
Authorization: Bearer <token>
```
Verifies if the current session is valid.

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```
Logs out the current user.

### Protected Endpoints (Require Authentication)

#### Upload File
```
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: { file: <file> }
```
Uploads a file to Supabase Storage. Requires valid JWT token.

#### List Files
```
GET /api/files
Authorization: Bearer <token>
```
Returns a list of all uploaded files with their metadata and URLs. Requires valid JWT token.

### Public Endpoints

#### Health Check
```
GET /api/health
```
Returns server status (no authentication required).

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
│   │   │   ├── FileList.css
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Auth.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx
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
├── AUTH_SETUP.md         # Authentication setup guide
├── SUPABASE_SETUP.md     # Storage setup guide
├── package.json
└── README.md
```

## Troubleshooting

### Authentication Issues

#### "Failed to create account" or "Failed to login"
- **Check API Key**: Must use **service_role** key, not anon public key
- **Disable Email Confirmation**: Go to Supabase → Authentication → Settings → Disable email confirmation
- **Check Password**: Must be at least 6 characters
- **Verify Supabase Auth**: Make sure Email provider is enabled in Authentication → Providers

#### Can't access file upload (stuck on login)
- Clear browser localStorage
- Check browser console for errors
- Verify service_role key is set correctly
- Check server logs for authentication errors

### Storage Issues

#### "SUPABASE_URL and SUPABASE_KEY must be set"
Make sure you've created a `.env` file with your Supabase credentials and service_role key.

#### Upload fails with "Failed to upload file to storage"
- Check that your Supabase **service_role** key is correct
- Verify that the bucket name matches your Supabase bucket
- Ensure the bucket has the correct permissions (see SUPABASE_SETUP.md)
- Check bucket policies allow uploads

#### Files not appearing in the list
- Make sure the bucket name in `.env` matches your Supabase bucket
- Check that files were uploaded successfully
- Verify bucket permissions allow reading files
- Check that you're logged in (authentication required)

### For detailed guides:
- **Architecture**: See `ARCHITECTURE.md` for complete system design
- **Authentication**: See `AUTH_SETUP.md`
- **Storage**: See `SUPABASE_SETUP.md`
- **Deployment**: See `DEPLOY.md`

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
