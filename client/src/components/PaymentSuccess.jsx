import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './PaymentSuccess.css'

function PaymentSuccess() {
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const sessionId = sessionStorage.getItem('payment_session_id')
      
      if (!sessionId) {
        setError('No payment session found')
        setVerifying(false)
        return
      }

      // Verify payment with backend
      const response = await axios.get(`/api/payment/verify/${sessionId}`)
      
      if (response.data.verified) {
        setVerified(true)
        // Clear session ID
        sessionStorage.removeItem('payment_session_id')
      } else {
        setError('Payment verification failed. Status: ' + response.data.status)
      }

    } catch (err) {
      console.error('Verification error:', err)
      setError('Failed to verify payment')
    } finally {
      setVerifying(false)
    }
  }

  const handleContinue = () => {
    navigate('/')
  }

  if (verifying) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card">
          <div className="spinner-large"></div>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card payment-error-card">
          <div className="icon-error">✗</div>
          <h2>Verification Error</h2>
          <p>{error}</p>
          <button onClick={handleContinue} className="continue-button">
            Return to App
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="icon-success">✓</div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment. Your transaction has been completed successfully.</p>
        
        <div className="success-details">
          <p>✅ Payment confirmed</p>
          <p>✅ Account updated</p>
          <p>✅ You can now enjoy premium features</p>
        </div>

        <button onClick={handleContinue} className="continue-button">
          Continue to App
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess

