import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { signOut } from "@/app/auth/actions";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { getDashboardAnalytics } from "@/lib/analytics";
import { Plus, Mail, Hash, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

function resolveCustomerDisplayName(params: {
  profileFullName?: string | null;
  metaFullName?: string | null;
  metaName?: string | null;
  email?: string | null;
}): string {
  const fromProfile = params.profileFullName?.trim();
  if (fromProfile) return fromProfile;

  const fromMetaFull = params.metaFullName?.trim();
  if (fromMetaFull) return fromMetaFull;

  const fromMetaName = params.metaName?.trim();
  if (fromMetaName) return fromMetaName;

  const emailPrefix = params.email?.split("@")[0]?.trim();
  if (emailPrefix) return emailPrefix;

  return "Maker";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch authenticated customer's profile row using server-verified user.id (UUID)
  let { data: profile } = await supabase
    .from("profiles")
    .select("cust_id_ext, email, full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // Ensure existing pre-trigger customers also have a profile row and receive their cust_id_ext
  if (!profile) {
    const fallbackName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      null;
    const fallbackAvatar =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      null;

    const { data: syncedProfile } = await db
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          full_name: fallbackName,
          avatar_url: fallbackAvatar,
        },
        { onConflict: "id" }
      )
      .select("cust_id_ext, email, full_name, avatar_url, created_at")
      .single();

    profile = syncedProfile;
  }

  const customerName = resolveCustomerDisplayName({
    profileFullName: profile?.full_name,
    metaFullName: user.user_metadata?.full_name as string | undefined,
    metaName: user.user_metadata?.name as string | undefined,
    email: profile?.email || user.email,
  });

  const customerEmail = profile?.email || user.email || "";

  // Fetch customer's Launch Plan payment history (strictly by server-verified user.id)
  const { data: myPayments } = await db
    .from("payments")
    .select("id, plan_id, listing_id, amount, currency, status, razorpay_order_id, paid_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const linkedListingIds = (myPayments || [])
    .map((p) => p.listing_id)
    .filter((id): id is number => Number.isFinite(id) && (id as number) > 0);

  // Fetch tools submitted by this authenticated customer's email OR linked to their payments
  let listingsQuery = db
    .from("listings")
    .select("id, slug, name, tagline, status, pricing_model, created_at");

  if (linkedListingIds.length > 0) {
    listingsQuery = listingsQuery.or(
      `submitted_by_email.eq.${customerEmail.toLowerCase().trim()},id.in.(${linkedListingIds.join(",")})`
    );
  } else {
    listingsQuery = listingsQuery.eq("submitted_by_email", customerEmail);
  }

  const { data: myListings } = await listingsQuery.order("created_at", { ascending: false });

  // Fetch initial customer analytics strictly scoped to customer's own tools
  const initialAnalytics = await getDashboardAnalytics({
    timeRange: "30d",
    filterByEmail: customerEmail,
  });

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B]">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Top Customer Identity Banner */}
        <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F6FF] px-3 py-1 text-xs font-mono font-bold text-[#4F46E5]">
              <Hash className="h-3.5 w-3.5" />
              <span>Customer ID: #{profile?.cust_id_ext}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#14142B]">
              Welcome, {customerName}!
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#55556E] font-mono">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#55556E]" />
                {customerEmail}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/submit">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Submit a Tool
              </Button>
            </Link>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Analytics Section (Clean maker analytics scoped to user's tools) */}
        <section className="space-y-4">
          <DashboardAnalytics
            initialData={initialAnalytics}
            isAdmin={false}
            userEmail={customerEmail}
          />
        </section>

        {/* Customer's Submitted Tools */}
        <section className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-[#14142B]">
                Your Submitted Tools
              </h2>
              <p className="text-xs text-[#55556E]">
                Tools submitted with {customerEmail}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#4F46E5]">
              {myListings?.length || 0} total
            </span>
          </div>

          {!myListings || myListings.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-[#55556E]">
                You haven&apos;t submitted any tools yet.
              </p>
              <Link href="/submit">
                <Button variant="primary" size="sm">
                  Submit Your First Tool
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6F0]">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#14142B]">
                        {item.name}
                      </span>
                      <span className="font-mono text-xs text-[#55556E]">
                        (ID: {item.id})
                      </span>
                    </div>
                    <p className="text-xs text-[#55556E]">{item.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                        item.status === "approved"
                          ? "bg-[#ECFDF5] text-[#0F8A5F]"
                          : item.status === "rejected"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#FFF1D6] text-[#7A4E00]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Customer's Launch Plan Purchases & Payment History */}
        <section className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E6F0] pb-4">
            <div>
              <h2 className="font-heading font-extrabold text-lg text-[#14142B]">
                Launch Plan Purchases &amp; Billing History
              </h2>
              <p className="text-xs text-[#55556E]">
                Verified Razorpay launch tier purchases for your account
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="secondary" size="sm">
                Upgrade Launch Plan
              </Button>
            </Link>
          </div>

          {!myPayments || myPayments.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs sm:text-sm text-[#55556E]">
                No paid launch plans purchased yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E6E6F0]">
              {myPayments.map((pay) => (
                <div
                  key={pay.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#14142B] uppercase">
                        {pay.plan_id} Tier
                      </span>
                      <span className="font-mono text-xs text-[#55556E]">
                        (Payment #{pay.id})
                      </span>
                    </div>
                    <p className="text-xs text-[#55556E] font-mono">
                      Order: {pay.razorpay_order_id} • {pay.currency} {pay.amount}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                      pay.status === "paid"
                        ? "bg-[#ECFDF5] text-[#0F8A5F]"
                        : pay.status === "failed"
                        ? "bg-[#FEF2F2] text-[#DC2626]"
                        : "bg-[#FFF1D6] text-[#7A4E00]"
                    }`}
                  >
                    {pay.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
