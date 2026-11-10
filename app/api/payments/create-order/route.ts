import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { getRazorpayClient } from "@/lib/razorpay";
import { getPlanById } from "@/config/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const planId = String(body?.planId || "").trim();
    const rawListingId = body?.listingId;

    // 1. Resolve authoritative LaunchOS plan from config/site.ts
    const configPlan = getPlanById(planId);
    if (!configPlan || configPlan.id === "free" || configPlan.price <= 0) {
      return NextResponse.json(
        { error: "Invalid paid launch plan selected." },
        { status: 400 }
      );
    }

    // Sync plan into public.plans so any price edit in config/site.ts is reflected in DB
    await db.from("plans").upsert(
      {
        id: configPlan.id,
        name: configPlan.name,
        description: configPlan.description,
        price: configPlan.price,
        price_minor: configPlan.price_minor,
        currency: configPlan.currency,
        is_active: true,
      },
      { onConflict: "id" }
    );

    // 2. Create Order in Razorpay using authoritative price_minor from config/site.ts
    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: configPlan.price_minor,
      currency: configPlan.currency || "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        planId: configPlan.id,
        planName: configPlan.name,
      },
    });

    // 3. Save pending payment record in public.payments (BIGINT id >= 50000000)
    const numericListingId = rawListingId ? Number(rawListingId) : null;
    const validListingId =
      Number.isInteger(numericListingId) && (numericListingId as number) > 0
        ? numericListingId
        : null;

    const { data: paymentRow, error: insertError } = await db
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: configPlan.id,
        listing_id: validListingId,
        razorpay_order_id: razorpayOrder.id,
        amount: configPlan.price,
        currency: configPlan.currency,
        status: "created",
        payer_email: user.email ?? null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[Payments/Create-Order] Error saving payment order:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Failed to record order." },
        { status: 500 }
      );
    }

    // 4. Append immutable audit log into public.payment_gateway_events
    await db.from("payment_gateway_events").insert({
      razorpay_event_id: `order_created_${razorpayOrder.id}`,
      event_type: "order.created",
      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: null,
      payment_id: paymentRow?.id ?? null,
      signature_valid: true,
      payload: {
        planId: configPlan.id,
        planName: configPlan.name,
        amount: configPlan.price,
        amount_minor: configPlan.price_minor,
        currency: configPlan.currency,
      },
      processing_result: "order_created",
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: razorpay.key_id,
      planId: configPlan.id,
      planName: configPlan.name,
      userEmail: user.email,
    });
  } catch (err: unknown) {
    console.error("create_order_error", err);
    const message =
      err instanceof Error ? err.message : "Failed to create order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

