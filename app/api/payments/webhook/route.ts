import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/webhook
 * Server-to-server Razorpay Webhook handler for payment reconciliation.
 * Ensures payments are marked 'paid' even if the user closes their browser
 * before client callback verification completes.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const eventHeaderId = req.headers.get("x-razorpay-event-id") || "";

    // Fail-closed: reject if webhook secret is missing or signature invalid
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const eventType = String(payload?.event || "");
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const orderId = String(
      paymentEntity?.order_id || orderEntity?.id || ""
    ).trim();
    const paymentId = String(paymentEntity?.id || "").trim();
    const eventId =
      eventHeaderId ||
      (paymentId ? `webhook_${eventType}_${paymentId}` : `webhook_${eventType}_${orderId}`);

    if (!eventType || !orderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // 1. Idempotency check against payment_gateway_events
    if (eventId) {
      const { data: existingEvent } = await db
        .from("payment_gateway_events")
        .select("id")
        .eq("razorpay_event_id", eventId)
        .maybeSingle();

      if (existingEvent) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
    }

    // 2. Look up matching order in payments
    const { data: paymentRow } = await db
      .from("payments")
      .select("id, plan_id, listing_id, status, amount, currency")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (!paymentRow) {
      return NextResponse.json({ ok: true, ignored: "order_not_found" });
    }

    let processingResult = "ignored";

    // 3. Reconcile captured/paid orders (never downgrade an already 'paid' order)
    if (
      (eventType === "payment.captured" || eventType === "order.paid") &&
      paymentRow.status !== "paid"
    ) {
      const paidAt = new Date().toISOString();
      await db
        .from("payments")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId || undefined,
          paid_at: paidAt,
        })
        .eq("id", paymentRow.id)
        .neq("status", "paid");

      if (paymentRow.listing_id && paymentRow.plan_id) {
        await db
          .from("listings")
          .update({ listing_plan: paymentRow.plan_id })
          .eq("id", paymentRow.listing_id);
      }

      processingResult = "reconciled_paid";
    } else if (eventType === "payment.failed" && paymentRow.status === "created") {
      await db
        .from("payments")
        .update({
          status: "failed",
          razorpay_payment_id: paymentId || undefined,
        })
        .eq("id", paymentRow.id)
        .eq("status", "created");

      processingResult = "marked_failed";
    } else if (paymentRow.status === "paid") {
      processingResult = "already_paid";
    }

    // 4. Append immutable audit log
    await db.from("payment_gateway_events").insert({
      razorpay_event_id: eventId,
      event_type: eventType,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId || null,
      payment_id: paymentRow.id,
      signature_valid: true,
      payload,
      processing_result: processingResult,
    });

    return NextResponse.json({ ok: true, processingResult });
  } catch (err: unknown) {
    console.error("[Payments/Webhook] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Webhook processing error." },
      { status: 500 }
    );
  }
}

