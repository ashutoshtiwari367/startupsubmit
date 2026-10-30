// lib/payment-service.ts
// Clean payment service interface for Stripe / Razorpay integration.
// Supports frontend testing via a mock adapter switch without faking production charges.

import type { ListingTier } from '@/lib/type';

export interface CheckoutSessionRequest {
  tier: ListingTier;
  startupName: string;
  startupSlug?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  mode: 'live' | 'mock';
  provider: 'mock' | 'stripe' | 'razorpay';
}

export interface PaymentServiceInterface {
  createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSessionResponse>;
  verifyPayment(sessionId: string): Promise<{ success: boolean; tier: ListingTier }>;
}

/**
 * Mock adapter for frontend testing and sandbox demonstration.
 * Configured via NEXT_PUBLIC_PAYMENT_MODE ('mock' | 'live', defaults to 'mock' for local dev).
 */
class MockPaymentService implements PaymentServiceInterface {
  async createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const mockSessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // In mock mode, deep-link to successUrl with mock token
    const url = new URL(req.successUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    url.searchParams.set('session_id', mockSessionId);
    url.searchParams.set('tier', req.tier);
    url.searchParams.set('mock_payment', 'true');

    return {
      sessionId: mockSessionId,
      checkoutUrl: url.toString(),
      mode: 'mock',
      provider: 'mock',
    };
  }

  async verifyPayment(sessionId: string): Promise<{ success: boolean; tier: ListingTier }> {
    return {
      success: sessionId.startsWith('mock_sess_'),
      tier: 'featured',
    };
  }
}

/**
 * Production Stripe/Razorpay adapter placeholder.
 * TODO: Initialize Stripe or Razorpay client using server credentials when ready to take real cards/UPI.
 */
class ProductionPaymentService implements PaymentServiceInterface {
  async createCheckoutSession(_req: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    // TODO: Wire stripe.checkout.sessions.create() or razorpay.orders.create()
    throw new Error(
      'Live payment gateway not yet configured. Set STRIPE_SECRET_KEY or RAZORPAY_KEY_SECRET in .env.'
    );
  }

  async verifyPayment(_sessionId: string): Promise<{ success: boolean; tier: ListingTier }> {
    // TODO: Verify webhook event or fetch checkout session
    throw new Error('Live payment verification not yet configured.');
  }
}

const isMock = process.env.NEXT_PUBLIC_PAYMENT_MODE !== 'live';

export const paymentService: PaymentServiceInterface = isMock
  ? new MockPaymentService()
  : new ProductionPaymentService();

