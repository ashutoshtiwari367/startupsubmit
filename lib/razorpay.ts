import "server-only";
import crypto from "crypto";
import { serverSecrets } from "@/lib/env/serverSecrets";
import { publicEnv } from "@/lib/env/publicEnv";

export interface RazorpayCreateOrderParams {
  amount: number; // Minor currency units (e.g. 5900 paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export function getRazorpayCredentials() {
  const key_id =
    serverSecrets.razorpayKeyId ||
    publicEnv.razorpayKeyId ||
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "";
  const key_secret =
    serverSecrets.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "";

  return { key_id, key_secret };
}

export function getRazorpayClient() {
  const { key_id, key_secret } = getRazorpayCredentials();

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials missing in environment variables.");
  }

  const basicAuth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");

  return {
    key_id,
    orders: {
      async create(
        params: RazorpayCreateOrderParams
      ): Promise<RazorpayOrderResponse> {
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify(params),
        });

        const data = await res.json();
        if (!res.ok) {
          const errDesc =
            data?.error?.description ||
            data?.message ||
            "Failed to create Razorpay order";
          throw new Error(errDesc);
        }

        return data as RazorpayOrderResponse;
      },
    },
  };
}

/**
 * Constant-time HMAC-SHA256 verification helper to prevent timing side-channel attacks.
 */
function verifyHmacSha256(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret || !payload || !signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedBuf = Buffer.from(generatedSignature, "utf8");
  const receivedBuf = Buffer.from(String(signature).trim(), "utf8");

  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Verifies Razorpay HMAC-SHA256 payment signature using constant-time comparison
 * (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secretOverride?: string
): boolean {
  const secret =
    secretOverride ??
    (serverSecrets.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || "");

  if (!orderId || !paymentId) {
    return false;
  }

  return verifyHmacSha256(`${orderId}|${paymentId}`, signature, secret);
}

/**
 * Verifies Razorpay server-to-server webhook signature (X-Razorpay-Signature)
 * using constant-time comparison against the raw request body.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secretOverride?: string
): boolean {
  const secret =
    secretOverride ??
    (serverSecrets.razorpayWebhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || "");

  return verifyHmacSha256(rawBody, signature, secret);
}

