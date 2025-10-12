import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadSuccess = (fileData) => {
    setUploadedFiles(prev => [fileData, ...prev]);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>File Upload Center</h1>
          <p className="subtitle">Upload any file to secure cloud storage</p>
        </header>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h2>Recently Uploaded Files</h2>
            <div className="files-list">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="file-info">
                    <h3>{file.originalName}</h3>
                    <p className="file-details">
                      {formatFileSize(file.size)} • {file.mimeType}
                    </p>
                  </div>
                  <div className="file-status">
                    <span className="success-badge">✓ Uploaded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('text')) return '📝';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
  return '📎';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export default App;

