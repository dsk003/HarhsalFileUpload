import { useState, useEffect } from 'react'
import axios from 'axios'
import './FileList.css'

function FileList({ uploadTrigger }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFiles()
  }, [uploadTrigger])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get('/api/files')
      setFiles(response.data.files)
    } catch (err) {
      setError('Failed to load files')
      console.error('Error fetching files:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return '🖼️'
    } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension)) {
      return '🎥'
    } else if (['pdf'].includes(extension)) {
      return '📄'
    } else if (['txt', 'doc', 'docx'].includes(extension)) {
      return '📝'
    } else if (['zip', 'rar', '7z'].includes(extension)) {
      return '📦'
    } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
      return '🎵'
    }
    return '📁'
  }

  if (loading) {
    return (
      <div className="file-list">
        <h2>Uploaded Files</h2>
        <div className="loading">
          <div className="spinner-large"></div>
          <p>Loading files...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="file-list">
        <h2>Uploaded Files</h2>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchFiles} className="retry-button">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h2>Uploaded Files</h2>
        <button onClick={fetchFiles} className="refresh-button" title="Refresh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12C4 7.58172 7.58172 4 12 4C14.5264 4 16.7792 5.17108 18.2454 7M20 12C20 16.4183 16.4183 20 12 20C9.47362 20 7.22082 18.8289 5.75463 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 3V7H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 21V17H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <p>No files uploaded yet</p>
          <p className="empty-subtitle">Upload your first file to get started</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map((file, index) => (
            <div key={index} className="file-card">
              <div className="file-icon">{getFileIcon(file.name)}</div>
              <div className="file-info">
                <h3 className="file-name" title={file.name}>{file.name}</h3>
                <p className="file-meta">
                  {formatFileSize(file.metadata?.size)}
                  {file.created_at && ` • ${formatDate(file.created_at)}`}
                </p>
              </div>
              <a 
                href={file.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="view-button"
                title="View file"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileList

