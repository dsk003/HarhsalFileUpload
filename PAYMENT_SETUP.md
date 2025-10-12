# Dodo Payments Integration Guide

This guide explains how to set up and use Dodo Payments checkout integration in the File Upload App.

## Overview

The app integrates with Dodo Payments to accept payments from authenticated users. When a user clicks the payment button:
1. A checkout session is created via the Dodo Payments API
2. The session is mapped to the logged-in user (user_id and username stored in metadata)
3. Payment page opens in a new tab
4. After successful payment, user returns to the app
5. Payment is verified and confirmed

## Required Environment Variables

You need to configure these variables in your `.env` file (locally) or Render dashboard (production):

### Local Development (.env)
```env
# Dodo Payments Configuration
DODO_API_KEY=your_dodo_payments_api_key_here
DODO_PRODUCT_ID=your_product_id_here
DODO_SUCCESS_URL=http://localhost:3000/payment-success
DODO_CANCEL_URL=http://localhost:3000
```

### Production (Render Environment Variables)
```
DODO_API_KEY=your_dodo_payments_api_key_here
DODO_PRODUCT_ID=your_product_id_here
DODO_SUCCESS_URL=https://your-app.onrender.com/payment-success
DODO_CANCEL_URL=https://your-app.onrender.com
```

## Getting Your Dodo Payments Credentials

### Step 1: Create Dodo Payments Account
1. Go to [https://dodopayments.com](https://dodopayments.com)
2. Sign up for an account
3. Complete verification if required

### Step 2: Get API Key
1. Log into Dodo Payments dashboard
2. Navigate to **Settings** → **API Keys**
3. For testing: Copy the **Test API Key**
4. For production: Copy the **Live API Key**
5. Store this as `DODO_API_KEY` in your environment variables

### Step 3: Create a Product
1. In Dodo Payments dashboard, go to **Products**
2. Click **Create Product**
3. Fill in product details:
   - **Name**: Your product/service name (e.g., "Premium Subscription")
   - **Price**: Set your price
   - **Currency**: Select currency (USD, EUR, etc.)
   - **Type**: One-time or recurring
4. Save the product
5. Copy the **Product ID** (will look like `prod_xxxxx`)
6. Store this as `DODO_PRODUCT_ID` in your environment variables

### Step 4: Configure Webhooks (Optional but Recommended)
1. In Dodo Payments dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - Local (for testing with ngrok): `https://your-ngrok-url.ngrok.io/api/webhooks/payment`
   - Production: `https://your-app.onrender.com/api/webhooks/payment`
4. Select events to listen to:
   - `checkout.completed`
   - `payment.succeeded`
   - `payment.failed`
   - `checkout.cancelled`
5. Save the webhook
6. Copy the **Signing Secret** (if needed for signature verification)

## How It Works

### 1. Payment Initiation

When a user clicks the payment button:

```javascript
// Frontend: PaymentButton.jsx
const handlePayment = async () => {
  // Calls backend to create checkout session
  const response = await axios.post('/api/checkout/create', {
    productId,  // Optional, uses DODO_PRODUCT_ID if not provided
    quantity    // Optional, defaults to 1
  })
  
  // Opens checkout in new tab
  window.open(response.data.checkoutUrl, '_blank')
}
```

### 2. Checkout Session Creation

Backend creates a checkout session with Dodo Payments:

```javascript
// Backend: server/index.js
POST /api/checkout/create

// Payload sent to Dodo Payments
{
  product_id: "prod_xxxxx",
  quantity: 1,
  customer: {
    email: "user@fileupload.app",
    name: "username"
  },
  metadata: {
    user_id: "uuid-of-logged-in-user",
    username: "username"
  },
  success_url: "http://localhost:3000/payment-success",
  cancel_url: "http://localhost:3000"
}

// API Call
POST https://test.dodopayments.com/checkouts
Authorization: Bearer YOUR_DODO_API_KEY
Content-Type: application/json
```

### 3. User Completes Payment

- User redirected to Dodo Payments checkout page
- User enters payment details
- Payment processed by Dodo Payments
- User redirected back to success_url

### 4. Payment Verification

After returning to the app:

```javascript
// Frontend: PaymentSuccess.jsx
// Verifies payment with backend
const response = await axios.get(`/api/payment/verify/${sessionId}`)

// Backend queries Dodo Payments API
GET https://test.dodopayments.com/checkouts/{sessionId}
Authorization: Bearer YOUR_DODO_API_KEY
```

### 5. Webhook Processing (Background)

Dodo Payments sends webhook notification:

```javascript
// Backend: server/index.js
POST /api/webhooks/payment

// Webhook payload
{
  type: "checkout.completed",
  data: {
    id: "checkout_xxxxx",
    status: "completed",
    metadata: {
      user_id: "uuid",
      username: "user"
    }
  }
}
```

## API Endpoints

### Create Checkout Session
```
POST /api/checkout/create
Authorization: Bearer <user-jwt-token>
Content-Type: application/json

Request Body:
{
  "productId": "prod_xxxxx",  // Optional
  "quantity": 1               // Optional
}

Response:
{
  "checkoutUrl": "https://test.dodopayments.com/checkout/...",
  "sessionId": "checkout_xxxxx",
  "message": "Checkout session created successfully"
}
```

### Verify Payment
```
GET /api/payment/verify/:sessionId
Authorization: Bearer <user-jwt-token>

Response:
{
  "verified": true,
  "status": "completed",
  "payment": { ... }
}
```

### Webhook Handler
```
POST /api/webhooks/payment
Content-Type: application/json

Request Body:
{
  "type": "checkout.completed",
  "data": { ... }
}

Response:
{
  "received": true
}
```

## Frontend Components

### PaymentButton Component

```jsx
import PaymentButton from './components/PaymentButton'

// Basic usage (uses DODO_PRODUCT_ID from env)
<PaymentButton />

// With custom product ID
<PaymentButton 
  productId="prod_xxxxx" 
  buttonText="Buy Premium"
/>

// With quantity
<PaymentButton 
  productId="prod_xxxxx"
  quantity={3}
  buttonText="Buy 3 Credits"
/>
```

### PaymentSuccess Component

Automatically handles payment verification after redirect:
- Shows loading spinner while verifying
- Displays success message if verified
- Shows error if verification fails
- Button to return to main app

## User Mapping

Each payment is automatically mapped to the logged-in user:

```javascript
// Metadata included in checkout session
metadata: {
  user_id: req.user.id,         // Supabase user ID
  username: req.user.username   // Username
}
```

You can access this in:
- Dodo Payments dashboard (under payment details)
- Webhook events (in event.data.metadata)
- Payment verification response

## Testing

### Test Mode

1. Set `DODO_API_KEY` to your **Test API Key**
2. Use test product IDs
3. Use test payment methods provided by Dodo Payments

### Test Payment Flow

1. Start the app: `npm run dev`
2. Login with a test account
3. Click the payment button
4. Use test card details (provided by Dodo Payments)
5. Complete payment
6. Verify redirect to success page
7. Check webhook logs in server console

### Test Cards (Example - check Dodo Payments docs for actual values)

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
```

## Production Deployment

### Checklist

- [ ] Switch to **Live API Key** from Dodo Payments
- [ ] Update `DODO_API_KEY` in Render environment variables
- [ ] Update `DODO_PRODUCT_ID` with live product ID
- [ ] Update `DODO_SUCCESS_URL` to production URL
- [ ] Update `DODO_CANCEL_URL` to production URL
- [ ] Configure production webhook URL in Dodo Payments dashboard
- [ ] Test payment flow in production
- [ ] Verify webhook delivery
- [ ] Monitor Dodo Payments dashboard for payments

### Environment Variables on Render

1. Go to Render dashboard
2. Select your web service
3. Go to **Environment** tab
4. Add/Update these variables:
   ```
   DODO_API_KEY=live_key_xxxxx
   DODO_PRODUCT_ID=prod_xxxxx
   DODO_SUCCESS_URL=https://your-app.onrender.com/payment-success
   DODO_CANCEL_URL=https://your-app.onrender.com
   ```
5. Click **Save Changes**
6. Redeploy if necessary

## Customization

### Multiple Products

You can support multiple products by passing different product IDs:

```jsx
<PaymentButton 
  productId="prod_basic"
  buttonText="Buy Basic Plan"
/>

<PaymentButton 
  productId="prod_premium"
  buttonText="Buy Premium Plan"
/>
```

### Custom Metadata

Add more user data to track:

```javascript
// In server/index.js, modify the checkout payload
metadata: {
  user_id: userId,
  username: username,
  user_email: req.user.email,
  signup_date: req.user.created_at,
  // Add any custom fields
}
```

### Post-Payment Actions

After successful payment, you can:

```javascript
// In server/index.js webhook handler
case 'checkout.completed':
  const userId = paymentData.metadata.user_id
  
  // Example actions:
  // 1. Update user to premium in database
  await updateUserToPremium(userId)
  
  // 2. Add credits to user account
  await addCredits(userId, 100)
  
  // 3. Send confirmation email
  await sendEmail(userId, 'Payment confirmed!')
  
  // 4. Log payment in your system
  await logPayment(userId, paymentData)
  
  break
```

## Troubleshooting

### "Payment configuration missing"
- Check that `DODO_API_KEY` is set in environment variables
- Verify the API key is correct (test vs live)

### "Product ID required"
- Set `DODO_PRODUCT_ID` in environment variables
- Or pass `productId` prop to `<PaymentButton>`

### "Failed to create checkout session"
- Verify API key is valid
- Check product ID exists in Dodo Payments dashboard
- Review server logs for detailed error

### Payment succeeds but verification fails
- Check that the session ID is stored correctly
- Verify API key has read permissions
- Check server logs for verification errors

### Webhooks not received
- Verify webhook URL is correct and accessible
- Check webhook configuration in Dodo Payments dashboard
- Test webhook using Dodo Payments webhook testing tool
- Ensure `/api/webhooks/payment` endpoint is not protected by auth

## Security Considerations

✅ **Authentication Required**: Checkout endpoint requires user login
✅ **User Mapping**: Every payment linked to authenticated user
✅ **Webhook Validation**: Add signature verification in production
✅ **API Key Security**: Store keys in environment variables, never in code
✅ **HTTPS**: Always use HTTPS in production
✅ **Token Expiry**: JWT tokens expire automatically

## Support & Documentation

- **Dodo Payments Docs**: https://docs.dodopayments.com
- **Dodo Payments Support**: support@dodopayments.com
- **Checkout API Reference**: https://docs.dodopayments.com/api/checkout

## Example Flow Diagram

```
User Clicks Payment Button
        ↓
Frontend: POST /api/checkout/create
        ↓
Backend: POST https://test.dodopayments.com/checkouts
        ↓
Backend: Returns checkout URL
        ↓
Frontend: Opens checkout in new tab
        ↓
User Completes Payment on Dodo Payments
        ↓
Dodo Payments: Redirects to /payment-success
        ↓
Frontend: GET /api/payment/verify/:sessionId
        ↓
Backend: GET https://test.dodopayments.com/checkouts/:sessionId
        ↓
Backend: Returns verification result
        ↓
Frontend: Shows success message
        ↓
(In background) Dodo Payments: POST /api/webhooks/payment
        ↓
Backend: Processes webhook, updates user status
```

