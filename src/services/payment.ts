import { PaymentDetails, WalletTransaction, SubscriptionStatus } from '../types';

class PaymentService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_3OOMFI_API_KEY || '';
    this.apiUrl = 'https://api.3oom.fi/v1';
  }

  private async request(endpoint: string, options: RequestInit) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment request failed');
      }

      return response.json();
    } catch (error) {
      console.error('Payment service error:', error);
      throw error;
    }
  }

  async createPaymentSession(details: PaymentDetails): Promise<{ sessionId: string; url: string }> {
    try {
      const response = await this.request('/payment-sessions', {
        method: 'POST',
        body: JSON.stringify({
          amount: details.amount,
          currency: 'USD',
          plan: details.plan,
          customer: {
            name: details.fullName,
            email: details.email,
          },
          metadata: {
            planId: details.plan,
          },
        }),
      });

      if (!response.sessionId || !response.url) {
        throw new Error('Invalid payment session response');
      }

      return response;
    } catch (error) {
      console.error('Error creating payment session:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<WalletTransaction> {
    try {
      return await this.request(`/payment-sessions/${sessionId}/verify`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async createSubscription(sessionId: string): Promise<{ 
    subscriptionId: string;
    status: SubscriptionStatus;
  }> {
    try {
      return await this.request('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
        }),
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<{ 
    status: SubscriptionStatus 
  }> {
    try {
      return await this.request(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      return await this.request(`/subscriptions/status/${userId}`, {
        method: 'GET'
      });
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();