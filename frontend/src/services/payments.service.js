import apiClient from './api.service';
import API_CONFIG from '../config/api.config';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(API_CONFIG.STRIPE_PUBLIC_KEY);

const paymentsService = {
  // Create payment intent
  async createPaymentIntent(amount, listingId) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CREATE_PAYMENT_INTENT, {
      amount,
      listingId
    });
    return response.data;
  },

  // Confirm payment
  async confirmPayment(paymentIntentId) {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.CONFIRM_PAYMENT, {
      paymentIntentId
    });
    return response.data;
  },

  // Get Stripe instance
  async getStripe() {
    return await stripePromise;
  },

  // Process payment with Stripe
  async processPayment(amount, listingId) {
    const stripe = await this.getStripe();
    const { clientSecret } = await this.createPaymentIntent(amount, listingId);
    
    return { stripe, clientSecret };
  }
};

export default paymentsService;
