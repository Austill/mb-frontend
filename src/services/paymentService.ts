import api from './authService';

export interface PaymentPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  priceAmount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  logo: string;
  supported: string[];
  countries: string[];
}

export interface PaymentData {
  email: string;
  phone: string;
  name?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  paymentMethodId: string;
  planId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  message: string;
}

// Available payment plans
export const paymentPlans: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: '$9.99',
    period: 'per month',
    description: 'Full access to all premium features',
    features: [
      'Unlimited mood tracking',
      'Advanced analytics & insights',
      'Personalized recommendations',
      'Priority crisis support',
      'Export your data',
      'Ad-free experience'
    ],
    priceAmount: 9.99,
    currency: 'USD'
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: '$99.99',
    period: 'per year',
    description: 'Best value - 2 months free!',
    features: [
      'All monthly features',
      '2 months free (17% savings)',
      'Priority customer support',
      'Early access to new features',
      'Advanced progress tracking',
      'Custom wellness goals'
    ],
    priceAmount: 99.99,
    currency: 'USD'
  }
];

// Available payment methods (African-focused)
export const paymentMethods: PaymentMethod[] = [
  {
    id: "flutterwave",
    name: "Flutterwave",
    description: "Secure payments across Africa",
    logo: "🏦",
    supported: ["Cards", "Mobile Money", "Bank Transfer", "USSD"],
    countries: ["NG", "KE", "GH", "UG", "TZ", "ZA", "RW"]
  },
  {
    id: "paystack",
    name: "Paystack",
    description: "Nigeria's leading payment processor",
    logo: "💳",
    supported: ["Cards", "Bank Transfer", "USSD", "QR Code"],
    countries: ["NG", "GH", "ZA"]
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "International card payments",
    logo: "💎",
    supported: ["Credit Cards", "Debit Cards", "Apple Pay", "Google Pay"],
    countries: ["US", "CA", "GB", "AU", "EU"]
  },
  {
    id: "mpesa",
    name: "M-Pesa",
    description: "Kenya's mobile money service",
    logo: "📱",
    supported: ["Mobile Money", "Paybill", "Till Number"],
    countries: ["KE", "TZ", "UG"]
  },
  {
    id: "airtel-money",
    name: "Airtel Money",
    description: "Mobile money across Africa",
    logo: "📲",
    supported: ["Mobile Money", "USSD"],
    countries: ["KE", "UG", "TZ", "ZM", "MW", "MG"]
  }
];

// Initialize payment with Flutterwave
export const initializeFlutterwavePayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    const plan = paymentPlans.find(p => p.id === paymentData.planId);
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    const response = await api.post('/payments/flutterwave/initialize', {
      email: paymentData.email,
      phone: paymentData.phone,
      name: paymentData.name,
      amount: plan.priceAmount,
      currency: plan.currency,
      planId: paymentData.planId,
      redirectUrl: `${window.location.origin}/payment/callback`
    });

    return {
      success: true,
      redirectUrl: response.data.paymentUrl,
      transactionId: response.data.transactionId,
      message: 'Payment initialized successfully'
    };
  } catch (error: any) {
    console.error('Flutterwave payment initialization failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed'
    };
  }
};

// Initialize payment with Paystack
export const initializePaystackPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    const plan = paymentPlans.find(p => p.id === paymentData.planId);
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    const response = await api.post('/payments/paystack/initialize', {
      email: paymentData.email,
      phone: paymentData.phone,
      name: paymentData.name,
      amount: plan.priceAmount * 100, // Paystack expects amount in kobo
      currency: plan.currency,
      planId: paymentData.planId,
      callbackUrl: `${window.location.origin}/payment/callback`
    });

    return {
      success: true,
      redirectUrl: response.data.authorizationUrl,
      transactionId: response.data.reference,
      message: 'Payment initialized successfully'
    };
  } catch (error: any) {
    console.error('Paystack payment initialization failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed'
    };
  }
};

// Initialize payment with Stripe
export const initializeStripePayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    const plan = paymentPlans.find(p => p.id === paymentData.planId);
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    const response = await api.post('/payments/stripe/initialize', {
      email: paymentData.email,
      name: paymentData.name,
      planId: paymentData.planId,
      successUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`
    });

    return {
      success: true,
      redirectUrl: response.data.checkoutUrl,
      transactionId: response.data.sessionId,
      message: 'Payment initialized successfully'
    };
  } catch (error: any) {
    console.error('Stripe payment initialization failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Payment initialization failed'
    };
  }
};

// Initialize M-Pesa payment
export const initializeMpesaPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    const plan = paymentPlans.find(p => p.id === paymentData.planId);
    if (!plan) {
      throw new Error('Invalid payment plan');
    }

    const response = await api.post('/payments/mpesa/initialize', {
      phone: paymentData.phone,
      amount: plan.priceAmount,
      planId: paymentData.planId,
      accountReference: `SERENITY-${Date.now()}`,
      transactionDesc: `SereniTree Premium - ${plan.name}`
    });

    return {
      success: true,
      transactionId: response.data.checkoutRequestId,
      message: 'Payment request sent to your phone. Please complete the transaction.'
    };
  } catch (error: any) {
    console.error('M-Pesa payment initialization failed:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'M-Pesa payment failed'
    };
  }
};

// Process payment based on selected method
export const processPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  switch (paymentData.paymentMethodId) {
    case 'flutterwave':
      return initializeFlutterwavePayment(paymentData);
    case 'paystack':
      return initializePaystackPayment(paymentData);
    case 'stripe':
      return initializeStripePayment(paymentData);
    case 'mpesa':
      return initializeMpesaPayment(paymentData);
    case 'airtel-money':
      // Similar implementation for Airtel Money
      return {
        success: false,
        message: 'Airtel Money integration coming soon'
      };
    default:
      return {
        success: false,
        message: 'Unsupported payment method'
      };
  }
};

// Verify payment status
export const verifyPayment = async (transactionId: string, paymentMethod: string): Promise<{
  success: boolean;
  status: 'pending' | 'completed' | 'failed';
  message: string;
}> => {
  try {
    const response = await api.get(`/payments/${paymentMethod}/verify/${transactionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Payment verification failed:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Payment verification failed'
    };
  }
};

// Get user's payment history
export const getPaymentHistory = async (): Promise<Array<{
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  planName: string;
  createdAt: string;
}>> => {
  try {
    const response = await api.get('/payments/history');
    return response.data.payments;
  } catch (error) {
    console.error('Failed to fetch payment history:', error);
    return [];
  }
};

// Cancel subscription
export const cancelSubscription = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/payments/subscription/cancel');
    return {
      success: true,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Failed to cancel subscription:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel subscription'
    };
  }
};
