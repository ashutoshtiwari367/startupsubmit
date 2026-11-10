"use client";

import React, { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { getAllPlans, SITE_CONFIG, type PlanId } from "@/config/site";

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    description?: string;
  };
}

interface RazorpayInstance {
  on: (
    event: string,
    callback: (response: RazorpayFailureResponse) => void
  ) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

export interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
}) => {
  const router = useRouter();
  const plans = getAllPlans();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    planId: PlanId;
  } | null>(null);

  const handleCheckout = async (planId: PlanId) => {
    if (planId === "free") {
      if (onSelectPlan) {
        onSelectPlan(planId);
      } else {
        router.push("/submit?plan=free");
      }
      return;
    }

    setErrorMessage(null);
    setSuccessInfo(null);
    setLoadingPlan(planId);

    try {
      // 1. Create Razorpay Order on Server
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setLoadingPlan(null);
          router.push("/login?next=/pricing");
          return;
        }
        throw new Error(orderData.error || "Order creation failed.");
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout SDK is still loading. Please try again in a moment."
        );
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: SITE_CONFIG.name,
        description: `${orderData.planName} — Directory Launch Tier`,
        order_id: orderData.orderId,
        prefill: {
          email: orderData.userEmail || "",
        },
        theme: { color: "#5B5BF0" },
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            // 3. Verify HMAC-SHA256 Payment Signature on Server
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setSuccessInfo({
                message:
                  verifyData.message ||
                  "Payment verified! Your LaunchOS tier is now active.",
                planId,
              });
            } else {
              setErrorMessage(
                verifyData.error || "Payment verification failed."
              );
            }
          } catch {
            setErrorMessage("Error verifying payment with server.");
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: RazorpayFailureResponse) => {
        setErrorMessage(
          resp.error?.description || "Payment could not be completed."
        );
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Network error starting checkout."
      );
      setLoadingPlan(null);
    }
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      {/* Razorpay Official Checkout SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="accent" size="sm" icon={<Zap className="h-3 w-3" />}>
          TRANSPARENT PRICING
        </Badge>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#0F0F10] tracking-[-0.03em]">
          Simple launch plans for every stage
        </h2>
        <p className="text-sm sm:text-base text-[#66666B]">
          Managed via <code className="font-mono text-xs bg-[#FAFAF7] px-1.5 py-0.5 rounded border border-[#E8E8E3]">config/site.ts</code> — choose Free, Freemium, Paid Pro, or One-Time Spotlight.
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 max-w-lg mx-auto rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-3.5 flex items-center gap-2.5 text-xs text-[#DC2626] text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert with Direct Launch CTA */}
        {successInfo && (
          <div className="mt-4 max-w-lg mx-auto rounded-[12px] border border-[#A7F3D0] bg-[#ECFDF5] p-4 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-[#065F46]">
              <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0" />
              <span>{successInfo.message}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  router.push(`/submit?plan=${encodeURIComponent(successInfo.planId)}`)
                }
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Submit Your Product Now
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                View in Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4 Launch Plans Grid ('free', 'freemium', 'paid', 'one_time') */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {plans.map((plan) => {
          const isPopular = plan.popular;
          const isProcessing = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-[16px] bg-white transition-all duration-200 ${
                isPopular
                  ? "border-2 border-[#5B5BF0] shadow-[0_8px_32px_rgba(91,91,240,0.12)] lg:-translate-y-1.5"
                  : "border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#D5D5CE]"
              } p-5 sm:p-6`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#5B5BF0] px-3 py-0.5 text-[11px] font-bold text-white shadow-[0_2px_8px_rgba(91,91,240,0.35)]">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <h3 className="font-heading font-extrabold text-lg text-[#0F0F10]">
                    {plan.name}
                  </h3>
                  {!isPopular && plan.badge && (
                    <span className="font-mono text-[10px] font-bold text-[#8E8E93] bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#66666B] min-h-[36px] leading-relaxed mb-4">
                  {plan.description}
                </p>

                {/* Price Display from config/site.ts */}
                <div className="flex items-baseline gap-1.5 border-b border-[#E8E8E3] pb-4 mb-4">
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#0F0F10] tracking-tight">
                    {plan.formattedPrice}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E93]">
                    / {plan.period}
                  </span>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E8E93] block">
                    Review SLA: {plan.reviewSla}
                  </span>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => {
                      const isHeader = feature.includes("plus:");

                      return (
                        <li
                          key={idx}
                          className={`flex items-start gap-2 text-xs ${
                            isHeader
                              ? "font-bold text-[#0F0F10] pt-0.5"
                              : "text-[#47474F]"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                              isPopular
                                ? "bg-[#EEF0FE] text-[#5B5BF0]"
                                : "bg-[#ECFDF5] text-[#059669]"
                            }`}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant={plan.ctaVariant}
                  size="md"
                  disabled={isProcessing}
                  className={`w-full font-bold text-xs ${
                    isPopular
                      ? "bg-[#5B5BF0] hover:bg-[#4C4CE0] text-white shadow-[0_2px_10px_rgba(91,91,240,0.3)]"
                      : ""
                  }`}
                  rightIcon={
                    isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )
                  }
                  onClick={() => handleCheckout(plan.id)}
                >
                  {isProcessing ? "Processing..." : plan.ctaText}
                </Button>
                <div className="mt-2 text-center text-[10px] font-mono text-[#8E8E93] flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-[#10B981]" />
                  <span>Razorpay Secured Checkout</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-[14px] border border-[#E8E8E3] bg-[#FAFAF7] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#E8E8E3] text-[#5B5BF0] shadow-xs">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-[#0F0F10]">
              30-Day Editorial Satisfaction &amp; Backlink Guarantee
            </div>
            <div className="text-xs text-[#66666B]">
              If your tool is rejected by our editorial guidelines, we issue a 100% refund.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
