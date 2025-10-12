import { useState } from 'react'
import axios from 'axios'
import './PaymentButton.css'

function PaymentButton({ buttonText = 'Upgrade to Premium ✨' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Please log in again to continue')
        setLoading(false)
        return
      }

      // Create checkout session with explicit token
      const response = await axios.post('/api/checkout/create', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const { checkoutUrl, sessionId } = response.data

      if (checkoutUrl) {
        // Store session ID for verification after return
        sessionStorage.setItem('payment_session_id', sessionId)
        
        // Open checkout in new tab
        window.open(checkoutUrl, '_blank')
        
        // Optional: Poll for payment completion
        // You can also handle this via webhook
      } else {
        setError('Failed to create checkout session')
      }

    } catch (err) {
      console.error('Payment error:', err)
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        setError('Session expired. Please refresh the page and try again.')
      } else if (err.response?.status === 500) {
        const details = err.response?.data?.details || err.response?.data?.message
        setError(details || 'Payment configuration error. Please check server settings.')
      } else {
        setError(
          err.response?.data?.error || 
          err.response?.data?.message || 
          'Failed to initiate payment. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="payment-button-container">
      <button 
        onClick={handlePayment} 
        disabled={loading}
        className="payment-button"
      >
        {loading ? (
          <>
            <span className="spinner-small"></span>
            Processing...
          </>
        ) : (
          buttonText
        )}
      </button>
      
      {error && (
        <div className="payment-error">
          <span>{error}</span>
          <button 
            onClick={() => setError('')} 
            className="error-dismiss"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      
      <p className="payment-info">
        Secure payment powered by Dodo Payments
      </p>
    </div>
  )
}

export default PaymentButton

