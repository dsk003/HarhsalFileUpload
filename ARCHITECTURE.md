# Application Architecture

## Overview

This is a full-stack file upload application with a **clean separation of concerns** between frontend and backend. The frontend is purely a presentation layer, while all business logic, validation, and external API calls are handled by the backend.

## Architecture Principles

### ✅ Frontend Responsibilities (Presentation Layer Only)
- **UI Rendering**: Display forms, components, and user interfaces
- **User Input Collection**: Gather data from user interactions
- **State Management**: Manage local UI state (loading, errors, form values)
- **API Communication**: Call backend endpoints (no direct external APIs)
- **Minimal UX Validation**: Basic field-empty checks for immediate user feedback

### ✅ Backend Responsibilities (Business Logic Layer)
- **All Validation**: Username format, password strength, input sanitization
- **All External API Calls**: Supabase authentication, storage operations
- **Business Rules**: File upload limits, user permissions
- **Data Processing**: File handling, metadata generation
- **Security**: Token verification, authentication, authorization
- **Error Handling**: Comprehensive error responses

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│                                                      │
│  • User Interface (forms, buttons, displays)        │
│  • State Management (useState, useContext)          │
│  • API Calls via Axios (no direct external APIs)    │
│  • Minimal UX validation (empty field checks)       │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP Requests (/api/*)
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Express/Node.js)              │
│                                                      │
│  • Input Validation & Sanitization                  │
│  • Business Logic                                   │
│  • Authentication/Authorization                     │
│  • All External API Calls                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ Supabase SDK
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                          │
│                                                      │
│  • Authentication (auth.users)                      │
│  • File Storage (Storage buckets)                  │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

All frontend interactions with external services go through these backend endpoints:

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Log out user

### File Operations
- `POST /api/upload` - Upload file to storage
- `GET /api/files` - List uploaded files

### Health Check
- `GET /api/health` - Server status

## Validation Strategy

### Frontend (UX Only)
```javascript
// Example: Signup.jsx
if (!username || !password || !confirmPassword) {
  setError('Please fill in all fields')  // Immediate UX feedback
  return
}

if (password !== confirmPassword) {
  setError('Passwords do not match')  // UI-level check
  return
}

// Send to backend - let backend validate everything else
await signup(username, password)
```

### Backend (Source of Truth)
```javascript
// Example: server/index.js
// Sanitize input
const sanitizedUsername = username.trim();

// Validate format
if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
  return res.status(400).json({ 
    error: 'Username can only contain letters, numbers, and underscores' 
  });
}

// Validate length
if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
  return res.status(400).json({ 
    error: 'Username must be 3-30 characters long' 
  });
}

// Validate password
if (password.length < 6 || password.length > 128) {
  return res.status(400).json({ 
    error: 'Password must be 6-128 characters long' 
  });
}
```

## Build Process for Render

### Single Build Command
```bash
npm run build
```

This command does:
1. `npm run install-client` - Installs frontend dependencies
2. `npm run build-client` - Builds React app with Vite

Result: Creates `client/dist/` with production-ready static files

### Start Command for Production
```bash
npm start
```

This runs `node server/index.js` which:
1. Starts Express server
2. Serves API endpoints on `/api/*`
3. Serves static React app from `client/dist/` (in production mode)
4. Handles client-side routing with catch-all route

## Environment Variables Required

### Development (.env file)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=uploads
PORT=3001
```

### Production (Render Environment Variables)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
SUPABASE_BUCKET=uploads
PORT=3001
NODE_ENV=production
```

## Security Features

### ✅ Input Sanitization
- Username trimming and character validation
- Password length limits
- SQL injection prevention (using Supabase SDK)

### ✅ Authentication
- JWT tokens issued by Supabase
- Token verification on every protected endpoint
- Secure session management

### ✅ Authorization
- Middleware (`verifyAuth`) protects all file operations
- User identity verified via Supabase on each request
- No client-side security decisions

### ✅ CORS
- Configured for secure cross-origin requests
- Production: Should be restricted to your domain

## Frontend Components

### AuthContext
- Manages authentication state
- Provides login/signup/logout functions
- Stores JWT token in localStorage
- Sets Authorization header for all axios requests

### FileUpload
- UI for file selection (drag & drop)
- Calls `/api/upload` endpoint
- No direct Supabase interaction

### FileList
- Displays uploaded files
- Calls `/api/files` endpoint
- No direct Supabase interaction

### Login/Signup
- Form UI and basic validation
- Calls backend auth endpoints
- No direct authentication logic

## No Business Logic in Frontend ✅

The frontend does NOT:
- ❌ Make direct calls to Supabase
- ❌ Make direct calls to any external APIs
- ❌ Validate business rules (only UX validation)
- ❌ Process sensitive data
- ❌ Make security decisions
- ❌ Handle file processing

The frontend ONLY:
- ✅ Renders UI components
- ✅ Collects user input
- ✅ Calls backend API endpoints
- ✅ Displays data from backend
- ✅ Provides immediate UX feedback

## Deployment Checklist for Render

1. **Repository Setup**
   - ✅ Code pushed to GitHub
   - ✅ `.gitignore` excludes `node_modules`, `.env`, `dist`

2. **Render Configuration**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Environment Variables** (Set in Render dashboard)
   - `NODE_ENV`: `production`
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase **service_role** key
   - `SUPABASE_BUCKET`: `uploads`
   - `PORT`: `3001`

4. **Supabase Setup**
   - Authentication enabled
   - Email confirmation disabled (using username@fileupload.app format)
   - Storage bucket created and configured
   - RLS policies set (if needed)

## Testing the Architecture

### Verify Frontend Has No Business Logic
```bash
# Search for direct Supabase calls in frontend
grep -r "createClient\|supabase\." client/src/
# Should return: No results (except maybe comments)

# Search for direct API calls to external services
grep -r "fetch\|axios" client/src/
# Should only show calls to /api/* endpoints
```

### Verify All Validation on Backend
```bash
# Check that backend validates all inputs
grep -A 10 "app.post\|app.get" server/index.js
# Should show validation before processing
```

## Performance Considerations

- Frontend is a Single Page Application (SPA)
- Static files served with proper caching headers
- API calls minimized with React state management
- File upload progress could be added in future
- Consider implementing file size limits client-side for UX

## Future Enhancements

### Backend
- Rate limiting on API endpoints
- File type validation
- Virus scanning for uploads
- File compression
- CDN integration for file delivery

### Frontend  
- Upload progress indicator
- Batch file uploads
- File preview before upload
- Download functionality
- Search and filter files

## Summary

This architecture follows **best practices for separation of concerns**:

- ✅ **Single Build Command**: Works perfectly with Render
- ✅ **No Business Logic in Frontend**: All validation and API calls in backend
- ✅ **Secure**: Backend is the security boundary
- ✅ **Scalable**: Easy to add new features
- ✅ **Maintainable**: Clear separation of responsibilities
- ✅ **Production Ready**: Optimized build process

All requirements met! 🎉

