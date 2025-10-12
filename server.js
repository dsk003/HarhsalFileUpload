const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Serve static files from frontend build
const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Serving frontend from:', distPath);
} else {
  console.log('⚠️  Frontend dist folder not found. Build the frontend first!');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const supabaseUrl = process.env.SUPABASE_STORAGE_URL || 'https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3';
    const supabaseKey = process.env.SUPABASE_API_KEY;

    if (!supabaseKey) {
      return res.status(500).json({ error: 'Supabase API key not configured' });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;

    // Create form data for Supabase
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: filename,
      contentType: req.file.mimetype,
    });

    // Upload to Supabase Storage
    const response = await axios.put(
      `${supabaseUrl}/uploads/${filename}`,
      req.file.buffer,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': req.file.mimetype,
          'x-upsert': 'true',
        },
      }
    );

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filename: filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: `${supabaseUrl}/uploads/${filename}`,
    });

  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to upload file',
      details: error.response?.data || error.message,
    });
  }
});

// Get list of uploaded files
app.get('/api/files', async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_STORAGE_URL || 'https://hfvezfqtlyegograuxqa.storage.supabase.co/storage/v1/s3';
    const supabaseKey = process.env.SUPABASE_API_KEY;

    if (!supabaseKey) {
      return res.status(500).json({ error: 'Supabase API key not configured' });
    }

    const response = await axios.get(
      `${supabaseUrl}/uploads`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('List files error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to list files',
      details: error.response?.data || error.message,
    });
  }
});

// Serve React app for all other routes (must be last)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({ 
      message: '🚀 File Upload API is running!',
      status: 'Frontend not built yet',
      note: 'Run "npm run build" to build the frontend',
      endpoints: {
        health: '/api/health',
        upload: 'POST /api/upload',
        files: '/api/files'
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

