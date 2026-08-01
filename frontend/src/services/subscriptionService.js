import apiClient from './apiClient';

const SubscriptionService = {
  // Subscription status
  getStatus: () => apiClient.get('/subscription/status'),
  
  // Get available plans
  getPlans: () => apiClient.get('/subscription/plans'),
  
  // Cancel subscription
  cancel: () => apiClient.post('/subscription/cancel'),
  
  // Payment
  createOrder: (plan, billingPeriod) => 
    apiClient.post('/payment/create-order', { plan, billingPeriod }),
  
  verifyPayment: (razorpay_order_id, razorpay_payment_id, razorpay_signature) =>
    apiClient.post('/payment/verify', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    }),
};

export default SubscriptionService;
