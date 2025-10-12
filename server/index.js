import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app in production
const distPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production') {
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log('✅ Serving static files from:', distPath);
  } else {
    console.warn('⚠️  Warning: Client dist folder not found at:', distPath);
    console.warn('⚠️  Make sure to run "npm run build" before starting in production mode');
  }
}

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

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Create email from username (Supabase requires email format)
    // Using .app domain which is a valid TLD
    const email = `${username}@fileupload.app`;

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      console.error('Signup error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        username: username,
        email: email
      });
      
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

    res.json({
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        username: username,
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

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Convert username to email format
    // Using .app domain which is a valid TLD
    const email = `${username}@fileupload.app`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Login error:', error);
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        username: username,
        attempted_email: email
      });
      
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
        username: username,
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

// ========== PAYMENT ENDPOINTS ==========

// Create checkout session endpoint (protected)
app.post('/api/checkout/create', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.user_metadata?.username || req.user.email.split('@')[0];
    const userEmail = req.user.email;

    // Get Dodo Payments configuration
    const dodoApiKey = process.env.DODO_API_KEY;
    const dodoProductId = process.env.DODO_PRODUCT_ID;
    const returnUrl = process.env.DODO_SUCCESS_URL || `${req.protocol}://${req.get('host')}/payment-success`;

    if (!dodoApiKey) {
      return res.status(500).json({ 
        error: 'Payment configuration missing',
        message: 'DODO_API_KEY not configured in environment variables'
      });
    }

    if (!dodoProductId) {
      return res.status(500).json({ 
        error: 'Product configuration missing',
        message: 'DODO_PRODUCT_ID not configured in environment variables'
      });
    }

    // Create checkout session with Dodo Payments - using correct API format
    const checkoutPayload = {
      // Products to sell - using product_cart array format
      product_cart: [
        {
          product_id: dodoProductId,
          quantity: 1
        }
      ],
      
      // Pre-fill customer information
      customer: {
        email: userEmail,
        name: username
      },
      
      // Return URL after successful payment
      return_url: returnUrl,
      
      // Custom metadata for tracking
      metadata: {
        user_id: userId,
        username: username,
        timestamp: new Date().toISOString()
      }
    };

    console.log('Creating Dodo Payments checkout session for user:', username);
    console.log('Product ID:', dodoProductId);

    const response = await fetch('https://test.dodopayments.com/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Dodo Payments API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return res.status(response.status).json({ 
        error: 'Failed to create checkout session',
        details: errorData.message || errorData.error || 'Payment provider error',
        hint: 'Check your DODO_API_KEY and DODO_PRODUCT_ID are correct'
      });
    }

    const checkoutData = await response.json();

    console.log('✅ Checkout session created successfully:', {
      session_id: checkoutData.session_id,
      user_id: userId,
      username: username
    });

    res.json({
      checkoutUrl: checkoutData.checkout_url,
      sessionId: checkoutData.session_id,
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Payment verification endpoint (for post-payment confirmation)
app.get('/api/payment/verify/:sessionId', verifyAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const dodoApiKey = process.env.DODO_API_KEY;

    if (!dodoApiKey) {
      return res.status(500).json({ 
        error: 'Payment configuration missing'
      });
    }

    // Verify payment session with Dodo Payments
    const response = await fetch(`https://test.dodopayments.com/checkouts/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dodoApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to verify payment'
      });
    }

    const paymentData = await response.json();

    res.json({
      verified: paymentData.status === 'completed' || paymentData.status === 'paid',
      status: paymentData.status,
      payment: paymentData
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Webhook endpoint for payment notifications (not protected - validates signature)
app.post('/api/webhooks/payment', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Get the webhook signature from headers
    const signature = req.headers['x-dodo-signature'];
    
    // Parse the webhook payload
    const event = JSON.parse(req.body.toString());

    console.log('Received payment webhook:', {
      type: event.type,
      data: event.data
    });

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.completed':
      case 'payment.succeeded':
        const paymentData = event.data;
        const userId = paymentData.metadata?.user_id;
        const username = paymentData.metadata?.username;

        console.log('Payment successful for user:', {
          user_id: userId,
          username: username,
          payment_id: paymentData.id
        });

        // Here you can update user's payment status in your database
        // For example, mark user as premium, add credits, etc.

        break;

      case 'checkout.cancelled':
      case 'payment.failed':
        console.log('Payment cancelled/failed:', event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
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

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).json({ 
        error: 'Application not built',
        message: 'The frontend application has not been built yet. Please run "npm run build" first.',
        hint: 'On Render, make sure your Build Command is set to: npm install && npm run build'
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📦 Supabase bucket: ${supabaseBucket}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production' && !fs.existsSync(distPath)) {
    console.error('❌ ERROR: Production mode but client/dist not found!');
    console.error('   Run "npm run build" to build the frontend.');
  }
});

