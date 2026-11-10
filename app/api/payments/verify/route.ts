import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const orderId = String(body?.orderId || "").trim();
    const paymentId = String(body?.paymentId || "").trim();
    const signature = String(body?.signature || "").trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing payment parameters" },
        { status: 400 }
      );
    }

    // 1. Lookup payment order belonging strictly to the authenticated user
    const { data: existingPayment } = await db
      .from("payments")
      .select("id, plan_id, listing_id, amount, currency, status")
      .eq("razorpay_order_id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment order not found for this account." },
        { status: 404 }
      );
    }

    // Idempotent return if already verified
    if (existingPayment.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified!",
        planId: existingPayment.plan_id,
        paymentRecordId: existingPayment.id,
      });
    }

    // 2. Verify Cryptographic HMAC-SHA256 Signature
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

    if (!isValid) {
      await db
        .from("payments")
        .update({ status: "failed" })
        .eq("id", existingPayment.id);

      await db.from("payment_gateway_events").insert({
        razorpay_event_id: `sig_invalid_${orderId}_${Date.now()}`,
        event_type: "payment.signature_invalid",
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        payment_id: existingPayment.id,
        signature_valid: false,
        payload: { orderId, paymentId },
        processing_result: "rejected_invalid_signature",
      });

      return NextResponse.json(
        { error: "Invalid signature. Fraud detected." },
        { status: 400 }
      );
    }

    // 3. Update Payment Status to 'paid'
    const paidAt = new Date().toISOString();
    const { data: paymentRow, error: updateError } = await db
      .from("payments")
      .update({
        razorpay_payment_id: paymentId,
        status: "paid",
        paid_at: paidAt,
      })
      .eq("id", existingPayment.id)
      .eq("user_id", user.id)
      .select("id, plan_id, listing_id, amount, currency")
      .single();

    if (updateError || !paymentRow) {
      console.error("[Payments/Verify] Error updating payment status:", updateError);
      return NextResponse.json(
        { error: updateError?.message || "Could not update payment status." },
        { status: 500 }
      );
    }

    // 4. Append immutable audit record in public.payment_gateway_events
    await db.from("payment_gateway_events").insert({
      razorpay_event_id: `payment_verified_${paymentId}`,
      event_type: "payment.verified",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      payment_id: paymentRow.id,
      signature_valid: true,
      payload: {
        orderId,
        paymentId,
        planId: paymentRow.plan_id,
        amount: paymentRow.amount,
        currency: paymentRow.currency,
      },
      processing_result: "paid",
    });

    // 5. LaunchOS Specific Action: If payment is linked to a listing, upgrade its pricing_model
    if (paymentRow.listing_id && paymentRow.plan_id) {
      await db
        .from("listings")
        .update({ pricing_model: paymentRow.plan_id })
        .eq("id", paymentRow.listing_id);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully! Your launch tier is active.",
      planId: paymentRow.plan_id,
      paymentRecordId: paymentRow.id,
    });
  } catch (err: unknown) {
    console.error("verify_error", err);
    const message =
      err instanceof Error ? err.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

