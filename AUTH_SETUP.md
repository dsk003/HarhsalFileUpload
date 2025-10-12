# Authentication Setup Guide

This guide explains how to set up and configure the authentication system for the File Upload App.

## Overview

The app now includes a complete username/password authentication system that:
- Requires users to sign up before accessing the file upload features
- Stores user credentials securely in Supabase Auth
- Protects all file upload and listing endpoints
- Manages user sessions with JWT tokens

## Authentication Flow

1. **First Visit**: User sees a login form
2. **New Users**: Can click "Sign up" to create an account
3. **Sign Up**: Enter username and password (min 6 characters)
4. **Login**: Use username and password to sign in
5. **Access Granted**: File upload interface becomes available
6. **Session**: Token stored in browser localStorage
7. **Logout**: Click logout button to end session

## Supabase Configuration

### Step 1: Enable Email Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. **IMPORTANT**: Disable email confirmation for username-based auth:
   - Go to **Authentication** → **Settings**
   - Find **"Enable email confirmations"** or **"Confirm email"**
   - Turn it **OFF** (since we're using usernames, not real emails)

### Step 2: Configure Email Settings (Optional)

Since we're using fake emails (username@fileupload.app), you can:
- Leave SMTP settings unconfigured
- Disable email confirmations (as mentioned above)
- This allows instant account creation without email verification

### Step 3: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the **`service_role` secret key** (NOT the anon public key)
3. **Important**: The service_role key is required for authentication to work properly

### Step 4: Set Environment Variables

#### For Local Development (.env file):
```env
SUPABASE_URL=https://hfvezfqtlyegograuxqa.supabase.co
SUPABASE_KEY=your_service_role_key_here
SUPABASE_BUCKET=uploads
PORT=3001
```

#### For Render Deployment:
Add these environment variables in Render:
- `SUPABASE_URL` = Your Supabase project URL
- `SUPABASE_KEY` = Your service_role key (NOT anon key)
- `SUPABASE_BUCKET` = `uploads`
- `NODE_ENV` = `production`
- `PORT` = `3001`

## How It Works

### Backend (Server)

1. **Authentication Endpoints**:
   - `POST /api/auth/signup` - Create new account
   - `POST /api/auth/login` - Sign in
   - `GET /api/auth/verify` - Verify session
   - `POST /api/auth/logout` - Sign out

2. **Protected Endpoints**:
   - `POST /api/upload` - Upload files (requires auth)
   - `GET /api/files` - List files (requires auth)

3. **Auth Middleware**:
   - Verifies JWT token from Authorization header
   - Checks token validity with Supabase
   - Blocks unauthorized requests

### Frontend (Client)

1. **AuthContext**: Manages authentication state globally
2. **Login Component**: Sign in form
3. **Signup Component**: Account creation form
4. **Protected Routes**: Main app only shows when authenticated
5. **Token Management**: Stores JWT in localStorage
6. **Auto-logout**: Removes invalid/expired tokens

### Username to Email Conversion

Since Supabase requires email format for authentication, we:
- Convert username → `username@fileupload.app`
- Store actual username in user metadata
- Display username (not email) in the UI
- `.app` is a valid TLD so Supabase accepts the email format

## Security Features

✅ **Password Requirements**: Minimum 6 characters
✅ **JWT Tokens**: Secure session management
✅ **Protected API**: All upload/file endpoints require auth
✅ **Token Verification**: Server validates every request
✅ **Secure Storage**: Passwords hashed by Supabase
✅ **HTTPS**: Use HTTPS in production (Render provides this)

## Testing the Authentication

### Local Testing

1. Start the app:
   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:3000`

3. Create an account:
   - Click "Sign up"
   - Enter username: `testuser`
   - Enter password: `password123`
   - Click "Create Account"

4. You should be logged in automatically

5. Try logging out and logging back in

### Verify in Supabase

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. You should see your test user
4. Email will be `testuser@fileupload.app`

## Troubleshooting

### Error: "Failed to create account"

**Possible causes:**
- Email confirmation is enabled (disable it)
- Username already exists
- Password too short (< 6 characters)
- Wrong API key (must use service_role key)

**Solution:**
1. Go to Supabase → Authentication → Settings
2. Disable email confirmation
3. Use service_role key, not anon key

### Error: "Invalid username or password"

**Possible causes:**
- Wrong credentials
- User doesn't exist
- Authentication not enabled in Supabase

**Solution:**
- Try creating a new account
- Check Supabase Authentication is enabled
- Verify service_role key is correct

### Error: "Unauthorized" or "No token provided"

**Possible causes:**
- Session expired
- Token not stored properly
- localStorage cleared

**Solution:**
- Log out and log back in
- Check browser console for errors
- Clear localStorage and try again

### Users Not Showing in Supabase

**Possible causes:**
- Wrong Supabase project
- API key incorrect
- Sign up failed silently

**Solution:**
- Verify SUPABASE_URL matches your project
- Double-check service_role key
- Check server logs for errors

## API Usage Examples

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### Upload File (with auth)
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### List Files (with auth)
```bash
curl http://localhost:3001/api/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Customization

### Change Password Requirements

Edit `server/index.js`:
```javascript
if (password.length < 8) {  // Change from 6 to 8
  return res.status(400).json({ 
    error: 'Password must be at least 8 characters long' 
  });
}
```

### Add Username Validation

Edit `server/index.js`:
```javascript
// Add after password validation
if (username.length < 3) {
  return res.status(400).json({ 
    error: 'Username must be at least 3 characters long' 
  });
}
```

### Change Token Expiry

This is configured in Supabase:
1. Go to Supabase Dashboard
2. Authentication → Settings
3. JWT Settings → JWT expiry limit
4. Default is 3600 seconds (1 hour)

## Production Checklist

Before deploying to production:

- [ ] Use service_role key (not anon key)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Disable email confirmation in Supabase
- [ ] Test signup and login flows
- [ ] Verify protected routes work
- [ ] Check storage bucket permissions
- [ ] Test file upload with authentication
- [ ] Verify logout functionality

## Additional Security (Optional)

For even better security, consider:

1. **Add password strength requirements**
2. **Implement rate limiting** (prevent brute force)
3. **Add CAPTCHA** (prevent bots)
4. **Enable 2FA** (two-factor authentication)
5. **Add password reset** functionality
6. **Implement account email verification** (for real emails)
7. **Add user roles** (admin, user, etc.)

## Support

If you encounter issues:
1. Check server logs for detailed errors
2. Verify Supabase Dashboard → Authentication → Users
3. Check browser console for frontend errors
4. Review the SUPABASE_SETUP.md for storage issues

For Supabase Auth documentation:
https://supabase.com/docs/guides/auth

