# Quick Start Guide - No-Build File Upload App

Get your file upload application running in **under 5 minutes**! 🚀

## Prerequisites

- ✅ Node.js installed (v14 or higher)
- ✅ A Supabase account (free tier works!)
- ✅ 5 minutes of your time

## Step 1: Supabase Setup (2 minutes)

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill in project details
5. Wait for project to initialize

### 1.2 Disable Email Confirmation
1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. **Disable** "Confirm email"
4. Click **Save**

### 1.3 Create Storage Bucket
1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name it `uploads`
4. Set it to **Public** (or configure policies)
5. Click **Create bucket**

### 1.4 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")

## Step 2: Application Setup (2 minutes)

### 2.1 Install Dependencies
```bash
cd FileUpload
npm install
```

### 2.2 Configure Environment
Create a `.env` file in the root directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_BUCKET=uploads
PORT=3001
```

**Replace** the values with your actual Supabase credentials from Step 1.4.

### 2.3 Start the Server
```bash
npm start
```

You should see:
```
🚀 Server is running on port 3001
📦 Supabase bucket: uploads
🌍 Environment: development
📁 Serving static files from: /path/to/public
```

## Step 3: Use the App (1 minute)

### 3.1 Open Browser
Navigate to: **http://localhost:3001**

### 3.2 Create Account
1. Click "Sign up"
2. Choose a username
3. Create a password (min 6 characters)
4. Click "Create Account"

### 3.3 Upload Files
1. Drag & drop a file OR click "Select File"
2. Click "Upload File"
3. See your file in the list below!
4. Click the eye icon to view/download

## That's It! 🎉

Your file upload application is now running with:
- ✅ User authentication
- ✅ Secure file uploads
- ✅ File management
- ✅ Modern UI
- ✅ **No build process!**

## Quick Commands

```bash
# Start the server
npm start

# Start in development mode (same as start, no build!)
npm run dev

# Stop the server
Ctrl + C
```

## Project Structure

```
FileUpload/
├── public/           # All your frontend files
│   ├── index.html   # Main HTML (just refresh to see changes!)
│   ├── styles.css   # All styles (edit and refresh!)
│   └── app.js       # JavaScript class (edit and refresh!)
├── server.js        # Express server
├── package.json     # Dependencies
└── .env            # Your secrets
```

## Making Changes

**HTML, CSS, or JavaScript**:
1. Edit the file in `public/`
2. Save
3. Refresh browser
4. Done! No build needed! 🎯

**Server code**:
1. Edit `server.js`
2. Save
3. Restart server (Ctrl+C, then `npm start`)
4. Done!

## Troubleshooting

### Server won't start
- ❌ **Port already in use**: Change PORT in `.env` to 3002 or 3003
- ❌ **Missing dependencies**: Run `npm install`
- ❌ **Supabase error**: Check your credentials in `.env`

### Can't sign up
- ❌ Check that email confirmation is **disabled** in Supabase
- ❌ Username must be 3-30 characters, alphanumeric + underscores
- ❌ Password must be at least 6 characters

### Upload fails
- ❌ Check that `uploads` bucket exists in Supabase Storage
- ❌ Check bucket is public OR has proper RLS policies
- ❌ Check file is under 50MB

### Changes not showing
- ❌ Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- ❌ Clear browser cache

## Next Steps

### Customize the App
- **Change colors**: Edit gradient values in `public/styles.css`
- **Add features**: Add methods to the `FileUploadApp` class in `public/app.js`
- **Modify UI**: Edit `public/index.html`

### Deploy to Production
See `README.md` for deployment instructions to:
- Render
- Railway
- Heroku
- Any Node.js host

**No build command needed for deployment!** Just set environment variables and run `npm start`.

## Common Questions

**Q: Do I need to run `npm run build`?**  
A: Nope! There is no build process. Just start the server and go!

**Q: Can I use React or Vue?**  
A: This is a no-build stack using vanilla JavaScript. If you want frameworks, you'll need a build process.

**Q: How do I add npm packages to the frontend?**  
A: Use CDN links in `index.html`. No bundler = no npm packages in frontend.

**Q: Where are my files stored?**  
A: In your Supabase Storage bucket. You can view them in the Supabase dashboard.

**Q: Is this production-ready?**  
A: Yes! It's simple but complete. Add HTTPS and you're good to go.

## Need Help?

1. Check `NO_BUILD_ARCHITECTURE.md` for detailed architecture info
2. Check `README.md` for full documentation
3. Check browser console for JavaScript errors
4. Check server logs for API errors
5. Check Supabase logs in the dashboard

## Enjoy!

You now have a fully functional file upload app with authentication, built with the simplest possible tech stack. No build tools, no frameworks, just good old HTML, CSS, and JavaScript! 🎊

**Happy coding!** 💻

