const API_BASE = import.meta.env["VITE_API_BASE"] || "http://localhost:3000";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  tokensIncluded: number;
  features: string[];
}

export interface PaymentIntentResponse {
  clientSecret: string | null;
  paymentIntentId?: string;
  free?: boolean;
  amount?: number;
  currency?: string;
}

export const SubscriptionsService = {
  async getSubscriptions(): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${API_BASE}/subscriptions`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }
    return response.json();
  },

  async getSubscriptionById(id: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${API_BASE}/subscriptions/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }
    return response.json();
  },

  async createPaymentIntent(userId: string, subscriptionId: string): Promise<PaymentIntentResponse> {
    const response = await fetch(`${API_BASE}/subscriptions/payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, subscriptionId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.statusText}`);
    }
    return response.json();
  },

  async subscribeUser(userId: string, subscriptionId: string, paymentIntentId?: string) {
    const response = await fetch(`${API_BASE}/subscriptions/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, subscriptionId, paymentIntentId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to subscribe user: ${response.statusText}`);
    }
    return response.json();
  },

  async cancelSubscription(userId: string) {
    const response = await fetch(`${API_BASE}/subscriptions/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel subscription: ${response.statusText}`);
    }
    return response.json();
  },
};
