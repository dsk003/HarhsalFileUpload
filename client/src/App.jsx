import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import './App.css'

function App() {
  const [uploadTrigger, setUploadTrigger] = useState(0)
  const [showSignup, setShowSignup] = useState(false)
  const { user, loading, logout, isAuthenticated } = useAuth()

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  // Show main app if authenticated
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div>
              <h1>File Upload App</h1>
              <p>Upload any file to Supabase Storage</p>
            </div>
            <div className="user-section">
              <span className="welcome-text">
                Welcome, <strong>{user.username}</strong>
              </span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        
        <FileList uploadTrigger={uploadTrigger} />
      </div>
    </div>
  )
}

export default App

