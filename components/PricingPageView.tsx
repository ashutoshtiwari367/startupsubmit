"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "./Badge";
import { AuthModal } from "./AuthModal";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PricingSection } from "./PricingSection";
import { getAllPlans } from "@/config/site";

export const PricingPageView: React.FC = () => {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(["pf-1", "pf-2"]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const plans = getAllPlans();

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-6 pb-20 space-y-12">
        {/* 4 Launch Plans + Razorpay Checkout (Managed via config/site.ts) */}
        <PricingSection />

        {/* MONEY BACK GUARANTEE STRIP */}
        <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white text-[#0F8A5F] flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#14142B]">
                100% Risk-Free 30-Day Money-Back Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#55556E] max-w-xl">
                If your submission is rejected by our editorial safety guidelines, or your dofollow backlink isn&apos;t indexed within 30 days, we issue a full unconditional refund.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#0F8A5F] font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Razorpay Verified Refund SLA</span>
          </div>
        </div>

        {/* COMPARISON TABLE (Dynamic from config/site.ts) */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="accent" size="sm">
              FULL SPECIFICATIONS
            </Badge>
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-tight">
              Compare all 4 launch tiers side-by-side
            </h2>
          </div>

          <div className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead className="bg-white border-b border-[#E6E6F0]">
                  <tr>
                    <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider text-[#55556E]">
                      Feature &amp; Deliverable
                    </th>
                    {plans.map((p) => (
                      <th
                        key={p.id}
                        className={`py-4 px-4 text-center ${
                          p.popular
                            ? "bg-[#4F46E5]/5 border-x border-[#4F46E5]/20"
                            : ""
                        }`}
                      >
                        <div className="font-heading font-bold text-xs sm:text-sm text-[#14142B]">
                          {p.name}
                        </div>
                        <div className="text-xs text-[#4F46E5] font-mono font-bold">
                          {p.formattedPrice}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6F0] text-xs sm:text-sm">
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#14142B]">
                      Editorial Review SLA
                    </td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className="py-3.5 px-4 text-center font-mono text-xs text-[#14142B]"
                      >
                        {p.reviewSla}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#14142B]">
                      Permanent Searchable Directory Page
                    </td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className="py-3.5 px-4 text-center text-[#0F8A5F]"
                      >
                        <Check className="h-4 w-4 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#14142B]">
                      Verified Maker Badge
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#14142B]">
                      Guaranteed DR 72+ Dofollow Backlink
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E] text-xs">
                      Top 3 Only
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E] text-xs">
                      Top 3 Only
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F] font-bold text-xs">
                      Guaranteed
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F] font-bold text-xs">
                      Guaranteed
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#14142B]">
                      7-Day Pinned Homepage Spotlight
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#55556E]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#0F8A5F] font-bold text-xs">
                      Included
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-tight">
              Frequently asked pricing questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                id: "pf-1",
                q: "Are there any recurring subscriptions or hidden renewals?",
                a: "No. Every paid launch tier on LaunchOS is a one-time payment. Your product page and backlink remain live permanently.",
              },
              {
                id: "pf-2",
                q: "What payment methods are supported?",
                a: "We process payments securely via Razorpay (UPI, Credit/Debit Cards, Netbanking, and Wallets) with cryptographic HMAC-SHA256 verification.",
              },
            ].map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#E6E6F0] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-heading font-bold text-sm sm:text-base text-[#14142B] pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform ${
                        isOpen
                          ? "bg-[#F7F6FF] text-[#4F46E5] rotate-180"
                          : "text-[#55556E]"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 sm:px-5 text-xs sm:text-sm text-[#52525A] leading-relaxed border-t border-[#E6E6F0]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA BAND */}
        <div className="rounded-[20px] bg-linear-to-r from-[#4F46E5] via-[#4F46E5] to-[#7676F7] p-8 sm:p-12 text-center text-white space-y-5">
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] tracking-tight">
            Ready to boost your domain authority?
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto">
            Submit your SaaS or AI product now.
          </p>
          <div className="pt-2">
            <Link href="/submit">
              <button
                type="button"
                className="rounded-[10px] bg-white px-7 py-3.5 text-sm font-extrabold text-[#4F46E5] hover:bg-[#F7F6FF] transition-all cursor-pointer"
              >
                Submit your product today &rarr;
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};
