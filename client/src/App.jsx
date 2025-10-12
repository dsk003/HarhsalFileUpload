import { useState } from 'react'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import './App.css'

function App() {
  const [uploadTrigger, setUploadTrigger] = useState(0)

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>File Upload App</h1>
          <p>Upload any file to Supabase Storage</p>
        </header>
        
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        
        <FileList uploadTrigger={uploadTrigger} />
      </div>
    </div>
  )
}

export default App

