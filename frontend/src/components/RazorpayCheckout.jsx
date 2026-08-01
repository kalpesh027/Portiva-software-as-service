// Razorpay checkout component.
// Script is loaded dynamically — NOT in index.html.
import { useState } from 'react'
import apiClient from '../services/apiClient';
import { useSelector } from 'react-redux'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src='${src}']`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    document.body.appendChild(s)
  })
}

export default function RazorpayCheckout({ plan, billingPeriod, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const user = useSelector((state) => state.auth?.user)

  async function handlePay() {
    setLoading(true)
    try {
      // 1. Create order on backend
      const { orderId, amount, currency, keyId } = await apiClient.post(
        '/payment/create-order',
        { plan, billingPeriod }
      )

      // 2. Load Razorpay checkout script dynamically
      await loadScript(RAZORPAY_SCRIPT)

      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: 'Portiva',
        description: `${plan} plan – ${billingPeriod}`,
        handler: async (response) => {
          // 4. Verify payment signature on backend
          const result = await apiClient.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          if (result.success) onSuccess(result.subscription)
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#1E4DB7' },
      })
      rzp.open()
    } catch (e) {
      // Errors bubble up as toast — consumer should pass onError prop or use global handler
      console.error('Payment failed', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? 'Processing…' : `Upgrade to ${plan}`}
    </button>
  )
}
