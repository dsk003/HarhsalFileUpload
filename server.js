import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log('✅ Serving static files from:', publicPath);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'uploads';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Middleware to verify authentication
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ========== AUTHENTICATION ENDPOINTS ==========

// Sign up endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Sanitize username - remove special characters
    const sanitizedUsername = username.trim();

    // Validate username format
    if (sanitizedUsername.length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    if (sanitizedUsername.length > 30) {
      return res.status(400).json({ 
        error: 'Username must not exceed 30 characters' 
      });
    }

    // Only allow alphanumeric and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      return res.status(400).json({ 
        error: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    if (password.length > 128) {
      return res.status(400).json({ 
        error: 'Password is too long' 
      });
    }

    // Create email from username (Supabase requires email format)
    const email = `${sanitizedUsername}@fileupload.app`;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: sanitizedUsername,
          display_name: sanitizedUsername
        },
        emailRedirectTo: undefined
      }
    });

    // Debug logging
    console.log('Signup response:', {
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userEmail: data?.user?.email,
      error: error
    });

    if (error) {
      console.error('Signup error:', error);
      
      // More specific error messages
      if (error.message?.includes('User already registered')) {
        return res.status(400).json({ 
          error: 'Username already exists',
          hint: 'Try logging in or use a different username'
        });
      }
      
      if (error.message?.includes('Email rate limit exceeded')) {
        return res.status(429).json({ 
          error: 'Too many signup attempts',
          hint: 'Please wait a few minutes before trying again'
        });
      }
      
      return res.status(400).json({ 
        error: error.message || 'Failed to create account',
        hint: 'Check that email confirmation is disabled in Supabase settings'
      });
    }

    // Check if session is null (email confirmation required)
    if (!data.session) {
      console.log('Session is null after signup - attempting auto-login...');
      
      // Try to immediately sign in with the credentials
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (loginError || !loginData.session) {
        console.error('Auto-login failed:', loginError);
        return res.status(400).json({
          error: 'Account created but email confirmation required',
          hint: 'Try logging in with your username and password',
          details: 'User was created but session could not be established'
        });
      }

      console.log('Auto-login successful!');
      // Return the login session
      return res.json({
        message: 'Account created successfully',
        user: {
          id: loginData.user.id,
          username: sanitizedUsername,
          email: loginData.user.email
        },
        session: loginData.session
      });
    }

    res.json({
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        username: sanitizedUsername,
        email: data.user.email
      },
      session: data.session
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Sanitize username
    const sanitizedUsername = username.trim();

    // Basic validation
    if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
      return res.status(401).json({ 
        error: 'Invalid username or password'
      });
    }

    // Convert username to email format
    const email = `${sanitizedUsername}@fileupload.app`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Login error:', error);
      
      // More specific error messages
      if (error.message?.includes('Email not confirmed')) {
        return res.status(401).json({ 
          error: 'Please confirm your email address',
          hint: 'Check your email for confirmation link'
        });
      }
      
      if (error.message?.includes('Invalid login credentials')) {
        return res.status(401).json({ 
          error: 'Invalid username or password',
          hint: 'If you created an account before, you may need to sign up again due to recent updates'
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid username or password',
        details: error.message
      });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        username: sanitizedUsername,
        email: data.user.email
      },
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Verify session endpoint
app.get('/api/auth/verify', verifyAuth, async (req, res) => {
  res.json({
    message: 'Session valid',
    user: {
      id: req.user.id,
      username: req.user.user_metadata?.username || req.user.email.split('@')[0],
      email: req.user.email
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  res.json({ message: 'Logged out successfully' });
});

// Upload endpoint (protected)
app.post('/api/upload', verifyAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ 
        error: 'Failed to upload file to storage',
        details: error.message,
        errorCode: error.statusCode || error.error,
        bucket: supabaseBucket,
        hint: 'Check if the bucket exists and has correct permissions in Supabase Storage'
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(fileName);

    res.json({
      message: 'File uploaded successfully',
      file: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        path: data.path,
        url: urlData.publicUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// List uploaded files (protected)
app.get('/api/files', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      return res.status(500).json({ 
        error: 'Failed to list files',
        details: error.message 
      });
    }

    const filesWithUrls = data.map(file => {
      const { data: urlData } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(file.name);
      
      return {
        ...file,
        url: urlData.publicUrl
      };
    });

    res.json({ files: filesWithUrls });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📦 Supabase bucket: ${supabaseBucket}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Serving static files from: ${publicPath}`);
});
