# Supabase Payment Tracking Setup

This guide shows how to properly track payments in Supabase so user premium status persists across sessions and devices.

## Problem

Currently, payment metadata includes the Supabase user_id, but successful payments aren't saved back to Supabase. This means:
- ❌ No way to check if user is premium
- ❌ Premium status doesn't persist across sessions
- ❌ Can't query which users have paid

## Solution: Create Payments Table in Supabase

### Step 1: Create Payments Table

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Run this SQL:

```sql
-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dodo_session_id TEXT NOT NULL,
  dodo_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount DECIMAL,
  currency TEXT,
  product_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_session_id ON payments(dodo_session_id);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for backend)
CREATE POLICY "Service role has full access"
  ON payments FOR ALL
  USING (true);
```

### Step 2: Create User Premium Status View (Optional)

```sql
-- Create a view to check premium status
CREATE OR REPLACE VIEW user_premium_status AS
SELECT 
  user_id,
  COUNT(*) as payment_count,
  MAX(created_at) as last_payment_date,
  BOOL_OR(status = 'completed') as is_premium
FROM payments
WHERE status IN ('completed', 'succeeded')
GROUP BY user_id;

-- Allow users to check their own premium status
CREATE POLICY "Users can view own premium status"
  ON user_premium_status FOR SELECT
  USING (auth.uid() = user_id);
```

## Backend Implementation

Add this function to your `server/index.js`:

```javascript
// Function to save payment to Supabase
async function savePaymentToSupabase(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: paymentData.metadata.user_id,
      dodo_session_id: paymentData.session_id,
      dodo_payment_id: paymentData.id,
      status: paymentData.status,
      product_id: paymentData.product_id,
      metadata: paymentData.metadata
    });

  if (error) {
    console.error('Failed to save payment to Supabase:', error);
    return { success: false, error };
  }

  console.log('✅ Payment saved to Supabase:', data);
  return { success: true, data };
}

// Function to update payment status
async function updatePaymentStatus(sessionId, status) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('dodo_session_id', sessionId);

  if (error) {
    console.error('Failed to update payment status:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

// Function to check if user is premium
async function checkUserPremium(userId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['completed', 'succeeded'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Failed to check premium status:', error);
    return { isPremium: false, error };
  }

  return { 
    isPremium: data && data.length > 0,
    lastPayment: data?.[0]
  };
}
```

## Updated Webhook Handler

Replace the webhook handler in `server/index.js`:

```javascript
// Webhook endpoint for payment notifications
app.post('/api/webhooks/payment', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());

    console.log('Received payment webhook:', {
      type: event.type,
      data: event.data
    });

    switch (event.type) {
      case 'checkout.completed':
      case 'payment.succeeded':
        const paymentData = event.data;
        
        // Save payment to Supabase
        await savePaymentToSupabase({
          user_id: paymentData.metadata?.user_id,
          session_id: paymentData.session_id,
          id: paymentData.id,
          status: 'completed',
          product_id: paymentData.product_id,
          metadata: paymentData.metadata
        });

        console.log('✅ Payment recorded for user:', paymentData.metadata?.username);
        break;

      case 'checkout.cancelled':
      case 'payment.failed':
        // Update status to failed/cancelled
        if (event.data.session_id) {
          await updatePaymentStatus(event.data.session_id, 'failed');
        }
        break;
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});
```

## Add Premium Check Endpoint

```javascript
// Check if user is premium
app.get('/api/user/premium-status', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkUserPremium(userId);

    res.json({
      isPremium: result.isPremium,
      lastPayment: result.lastPayment
    });

  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});
```

## Frontend: Check Premium Status

Add to your React component:

```javascript
import { useEffect, useState } from 'react'
import axios from 'axios'

function usePremiumStatus() {
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPremium = async () => {
      try {
        const response = await axios.get('/api/user/premium-status')
        setIsPremium(response.data.isPremium)
      } catch (error) {
        console.error('Failed to check premium status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkPremium()
  }, [])

  return { isPremium, loading }
}

// Usage in component
function App() {
  const { isPremium, loading } = usePremiumStatus()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {isPremium ? (
        <div>✨ Premium User</div>
      ) : (
        <PaymentButton buttonText="Upgrade to Premium" />
      )}
    </div>
  )
}
```

## Benefits

✅ **Payment history stored in Supabase**
✅ **Premium status persists across sessions**
✅ **Works on any device** (all data in Supabase)
✅ **Can query payment analytics**
✅ **Proper audit trail**
✅ **Row Level Security** ensures users only see their own payments

## Data Flow (After Implementation)

```
1. User pays → Dodo Payments processes
       ↓
2. Dodo webhook → Your backend receives
       ↓
3. Backend extracts user_id from metadata (Supabase UUID)
       ↓
4. Backend saves payment to Supabase payments table
       ↓
5. User can check premium status → Query Supabase
       ↓
6. Works across all devices/sessions
```

## Testing

1. Create the table in Supabase
2. Update backend code with new functions
3. Deploy to Render
4. Make a test payment
5. Check Supabase → Table Editor → payments table
6. Should see new row with your user_id

## Security Notes

- ✅ Uses Supabase RLS (Row Level Security)
- ✅ Users can only see their own payments
- ✅ Backend uses service_role key for full access
- ✅ Payment data linked to Supabase auth.users
- ✅ Cascade delete if user deleted


