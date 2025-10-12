import { useState } from 'react'
import axios from 'axios'
import './PaymentButton.css'

function PaymentButton({ productId, quantity = 1, buttonText = 'Subscribe / Pay' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create checkout session
      const response = await axios.post('/api/checkout/create', {
        productId,
        quantity
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
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to initiate payment. Please try again.'
      )
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
          {error}
        </div>
      )}
      
      <p className="payment-info">
        Secure payment powered by Dodo Payments
      </p>
    </div>
  )
}

export default PaymentButton

