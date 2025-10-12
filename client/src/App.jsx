import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Signup from './components/Signup'
import FileUpload from './components/FileUpload'
import FileList from './components/FileList'
import PaymentButton from './components/PaymentButton'
import PaymentSuccess from './components/PaymentSuccess'
import './App.css'

function MainApp() {
  const [uploadTrigger, setUploadTrigger] = useState(0)
  const { user, logout } = useAuth()

  const handleUploadSuccess = () => {
    setUploadTrigger(prev => prev + 1)
  }

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
        
        {/* Payment Button - Add productId from Dodo Payments dashboard */}
        <PaymentButton 
          productId={null}  // Will use DODO_PRODUCT_ID from env
          buttonText="Subscribe / Pay"
        />
        
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        
        <FileList uploadTrigger={uploadTrigger} />
      </div>
    </div>
  )
}

function App() {
  const [showSignup, setShowSignup] = useState(false)
  const { loading, isAuthenticated } = useAuth()

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

  // Show main app with routing if authenticated
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
    </Routes>
  )
}

export default App

