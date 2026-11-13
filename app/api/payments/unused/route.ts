import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/unused
 * Returns any verified paid payments belonging to the authenticated customer
 * that have not yet been attached to a listing (e.g. from an interrupted session or pre-pay).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: true, unusedPayments: [] });
    }

    const { data: unusedPayments, error } = await db
      .from("payments")
      .select("id, plan_id, amount, currency, status, razorpay_order_id, paid_at, created_at")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .is("listing_id", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      unusedPayments: unusedPayments || [],
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch unused payments";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

