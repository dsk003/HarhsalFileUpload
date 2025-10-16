# File Upload Application - No Build Stack

A modern file upload web application built with a **simple, no-build tech stack**. Upload files directly to Supabase storage with user authentication.

## 🎯 Tech Stack

### Backend
- **Node.js** with **Express.js** server
- **Supabase** for authentication and file storage
- RESTful API endpoints

### Frontend
- **Vanilla HTML** - No JSX, no template engines
- **Vanilla CSS** - No preprocessors, no frameworks
- **Vanilla JavaScript (ES6+)** - No TypeScript, no frameworks
- **Class-based architecture** - Organized, maintainable code

### Key Features
✅ **No build process** - Files run directly without compilation  
✅ **No bundlers** - No Vite, Webpack, Rollup, or Parcel  
✅ **No frameworks** - Pure HTML, CSS, and JavaScript  
✅ **CDN libraries** - External libraries loaded via CDN (none currently needed)  
✅ **Single server** - Express serves both static files and API endpoints  

## 📁 Project Structure

```
FileUpload/
├── public/              # Static files (served by Express)
│   ├── index.html      # Main HTML file
│   ├── styles.css      # All styles (combined)
│   └── app.js          # JavaScript application (class-based)
├── server.js           # Express server with API endpoints
├── package.json        # Node.js dependencies
├── .env                # Environment variables
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Supabase account with:
  - Authentication enabled
  - Storage bucket created
  - Email confirmation disabled (for username-based auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd FileUpload
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_BUCKET=uploads
   PORT=3001
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3001`

That's it! No build process needed. 🎉

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```

This runs the same command as `npm start` since there's no build process.

### Making Changes

- **HTML**: Edit `public/index.html` and refresh the browser
- **CSS**: Edit `public/styles.css` and refresh the browser
- **JavaScript**: Edit `public/app.js` and refresh the browser
- **Server**: Edit `server.js` and restart the server

No compilation, no bundling, no waiting!

## 📚 Application Features

### Authentication
- User signup with username and password
- User login with session management
- Secure logout
- JWT token-based authentication
- Session persistence with localStorage

### File Upload
- Drag and drop file upload
- Click to select file
- File size display
- Upload progress feedback
- Success/error notifications

### File Management
- View all uploaded files
- File icons based on type (images, videos, documents, etc.)
- File size and date display
- Click to view/download files
- Refresh file list

### UI/UX
- Modern gradient design
- Responsive layout (mobile-friendly)
- Smooth animations and transitions
- Loading states
- Error handling with user-friendly messages

## 🏗️ Architecture

### Frontend (Vanilla JavaScript)

The application uses a **single class** (`FileUploadApp`) to manage the entire frontend:

```javascript
class FileUploadApp {
  constructor() {
    // Initialize state and DOM elements
  }
  
  // Authentication methods
  async checkAuth() { }
  async handleLogin(e) { }
  async handleSignup(e) { }
  async handleLogout() { }
  
  // File upload methods
  handleFileSelect(e) { }
  async handleUpload() { }
  async loadFiles() { }
  
  // UI management methods
  showScreen(screen) { }
  showError(form, message) { }
  // ... more methods
}
```

### Backend (Express.js)

The server provides:
- **Static file serving** from `/public`
- **API endpoints**:
  - `POST /api/auth/signup` - Create new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/verify` - Verify token
  - `POST /api/auth/logout` - Logout user
  - `POST /api/upload` - Upload file (protected)
  - `GET /api/files` - List files (protected)
  - `GET /api/health` - Health check

### Authentication Flow

1. User enters username/password
2. Frontend sends credentials to `/api/auth/login` or `/api/auth/signup`
3. Backend validates with Supabase Auth
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Frontend includes token in all protected API requests
7. Backend verifies token for each protected request

### File Upload Flow

1. User selects or drags file
2. Frontend shows file preview
3. User clicks "Upload"
4. Frontend sends file via FormData to `/api/upload`
5. Backend uploads to Supabase Storage
6. Backend returns file URL
7. Frontend refreshes file list

## 🔐 Security

- JWT token authentication
- Protected API endpoints
- CORS enabled
- File size limits (50MB)
- Input validation and sanitization
- Secure password handling by Supabase

## 🌐 Deployment

### Deploy to Render, Railway, or any Node.js host

1. **Push code to GitHub**

2. **Set environment variables** on your hosting platform:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_BUCKET`
   - `PORT` (optional, defaults to 3001)

3. **Deploy**
   - Build Command: None needed! ✨
   - Start Command: `npm start`

The app is production-ready as-is. No build step required!

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_BUCKET` | Storage bucket name | No (defaults to 'uploads') |
| `PORT` | Server port | No (defaults to 3001) |

## 🛠️ Customization

### Adding Features

**To add a new page/view:**
1. Add HTML section in `public/index.html`
2. Add styles in `public/styles.css`
3. Add methods in `FileUploadApp` class in `public/app.js`

**To add a new API endpoint:**
1. Add route in `server.js`
2. Add corresponding method in `FileUploadApp` class

### Styling

All styles are in `public/styles.css`. The app uses:
- CSS variables for theming (easy to customize)
- Flexbox and Grid for layouts
- Media queries for responsiveness
- CSS animations for smooth transitions

### Adding External Libraries

If you need external libraries (rare for this stack):

1. Add via CDN in `public/index.html`:
   ```html
   <script src="https://cdn.example.com/library.js"></script>
   ```

2. No npm installation or bundling needed!

## 🤝 Contributing

This is a no-build project. Contributions should maintain this philosophy:
- No frameworks
- No build tools
- No bundlers
- Keep it simple!

## 📄 License

ISC License

## 🙏 Acknowledgments

- Supabase for backend services
- Modern browsers for ES6+ support
- The simplicity of vanilla JavaScript!

---

**Enjoy the simplicity of a no-build stack!** 🎉
