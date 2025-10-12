import { useState, useRef } from 'react'
import axios from 'axios'
import './FileUpload.css'

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus(null)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setUploadStatus(null)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({ type: 'error', message: 'Please select a file first' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadStatus(null)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadStatus({ 
        type: 'success', 
        message: `File "${response.data.file.name}" uploaded successfully!` 
      })
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onUploadSuccess()
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to upload file' 
      })
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="file-upload">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        
        <div className="upload-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C4.23858 18 2 15.7614 2 13C2 10.2386 4.23858 8 7 8C7.36064 8 7.71474 8.03194 8.05858 8.09332C8.01898 7.73385 8 7.36923 8 7C8 3.68629 10.6863 1 14 1C17.3137 1 20 3.68629 20 7C20 7.36923 19.981 7.73385 19.9414 8.09332C20.2853 8.03194 20.6394 8 21 8C23.7614 8 26 10.2386 26 13C26 15.7614 23.7614 18 21 18H7Z" fill="currentColor" opacity="0.3"/>
            <path d="M13 10L13 20M13 10L10 13M13 10L16 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="upload-text">
          <p className="upload-title">
            {file ? file.name : 'Drag & drop your file here'}
          </p>
          <p className="upload-subtitle">
            {file ? formatFileSize(file.size) : 'or'}
          </p>
        </div>

        <button 
          type="button" 
          className="select-button"
          onClick={handleButtonClick}
        >
          {file ? 'Choose Different File' : 'Select File'}
        </button>
      </div>

      {file && (
        <button 
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            'Upload File'
          )}
        </button>
      )}

      {uploadStatus && (
        <div className={`status-message ${uploadStatus.type}`}>
          {uploadStatus.type === 'success' ? '✓' : '✗'} {uploadStatus.message}
        </div>
      )}
    </div>
  )
}

export default FileUpload

