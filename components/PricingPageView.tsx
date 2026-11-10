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
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-20 space-y-12">
        {/* 4 Launch Plans + Razorpay Checkout (Managed via config/site.ts) */}
        <PricingSection />

        {/* MONEY BACK GUARANTEE STRIP */}
        <div className="rounded-[16px] border border-[#A7F3D0] bg-[#ECFDF5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-white text-[#059669] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0F0F10]">
                100% Risk-Free 30-Day Money-Back Guarantee
              </h3>
              <p className="text-xs sm:text-sm text-[#47474F] max-w-xl">
                If your submission is rejected by our editorial safety guidelines, or your dofollow backlink isn&apos;t indexed within 30 days, we issue a full unconditional refund.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#059669] font-bold">
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
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight">
              Compare all 4 launch tiers side-by-side
            </h2>
          </div>

          <div className="rounded-[16px] border border-[#E8E8E3] bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead className="bg-white border-b border-[#E8E8E3]">
                  <tr>
                    <th className="py-4 px-5 text-xs font-mono uppercase tracking-wider text-[#8E8E93]">
                      Feature &amp; Deliverable
                    </th>
                    {plans.map((p) => (
                      <th
                        key={p.id}
                        className={`py-4 px-4 text-center ${
                          p.popular
                            ? "bg-[#5B5BF0]/5 border-x border-[#5B5BF0]/20"
                            : ""
                        }`}
                      >
                        <div className="font-heading font-bold text-xs sm:text-sm text-[#0F0F10]">
                          {p.name}
                        </div>
                        <div className="text-xs text-[#5B5BF0] font-mono font-bold">
                          {p.formattedPrice}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E3] text-xs sm:text-sm">
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#0F0F10]">
                      Editorial Review SLA
                    </td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className="py-3.5 px-4 text-center font-mono text-xs text-[#0F0F10]"
                      >
                        {p.reviewSla}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#0F0F10]">
                      Permanent Searchable Directory Page
                    </td>
                    {plans.map((p) => (
                      <td
                        key={p.id}
                        className="py-3.5 px-4 text-center text-[#10B981]"
                      >
                        <Check className="h-4 w-4 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#0F0F10]">
                      Verified Maker Badge
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981]">
                      <Check className="h-4 w-4 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#0F0F10]">
                      Guaranteed DR 72+ Dofollow Backlink
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93] text-xs">
                      Top 3 Only
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93] text-xs">
                      Top 3 Only
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold text-xs">
                      Guaranteed
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold text-xs">
                      Guaranteed
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-5 font-medium text-[#0F0F10]">
                      7-Day Pinned Homepage Spotlight
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#8E8E93]">
                      <X className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="py-3.5 px-4 text-center text-[#10B981] font-bold text-xs">
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
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#0F0F10] tracking-tight">
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
                  className="rounded-[14px] border border-[#E8E8E3] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="font-heading font-bold text-sm sm:text-base text-[#0F0F10] pr-4">
                      {faq.q}
                    </span>
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform ${
                        isOpen
                          ? "bg-[#EEF0FE] text-[#5B5BF0] rotate-180"
                          : "text-[#8E8E93]"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 sm:px-5 text-xs sm:text-sm text-[#52525A] leading-relaxed border-t border-[#E8E8E3]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA BAND */}
        <div className="rounded-[20px] bg-linear-to-r from-[#4C4CE0] via-[#5B5BF0] to-[#7676F7] p-8 sm:p-12 text-center text-white space-y-5 shadow-[0_12px_40px_rgba(91,91,240,0.2)]">
          <h2 className="font-heading font-black text-2xl sm:text-4xl tracking-tight">
            Ready to boost your domain authority?
          </h2>
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto">
            Submit your SaaS or AI product now.
          </p>
          <div className="pt-2">
            <Link href="/submit">
              <button
                type="button"
                className="rounded-[10px] bg-white px-7 py-3.5 text-sm font-extrabold text-[#5B5BF0] shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:bg-[#FAF9FF] transition-all cursor-pointer"
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
