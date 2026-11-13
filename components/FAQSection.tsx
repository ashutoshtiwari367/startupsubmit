"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "q1",
    question: "Is it free to launch?",
    answer:
      "Yes, absolutely. Any founder can submit their SaaS or AI product for free. Free submissions enter our standard community review queue and participate in the 24-hour daily launch leaderboard. If your product finishes in the daily Top 3, you also earn permanent directory spotlight and an embeddable winner badge.",
  },
  {
    id: "q2",
    question: "How does the winner badge work?",
    answer:
      "Winners in the Top 3 (and all Premium Launch submissions) receive an official embeddable winner badge for your website, documentation, and GitHub README with live community vote counts and verified recognition.",
  },
  {
    id: "q3",
    question: "How are daily winners picked?",
    answer:
      "Winners are determined strictly by verified community engagement, editorial review, and quality signals during the 24-hour launch window (midnight to midnight PST). We employ strict verification to feature legitimate, high-quality software.",
  },
  {
    id: "q4",
    question: "How long does review take?",
    answer:
      "Free submissions typically undergo review within 3 to 5 business days to verify that the product is a legitimate, functional software application. Premium Launch submissions skip the queue and are reviewed and scheduled within 24 hours (or priority 1-hour fast-track for Featured Spotlight).",
  },
  {
    id: "q5",
    question: "Can I edit my listing after launch?",
    answer:
      "Yes! You can edit your product description, screenshots, changelogs, pricing model, and founder links anytime directly from your Maker Dashboard. When you ship major v2/v3 releases, you are also eligible to schedule a re-launch after 90 days.",
  },
  {
    id: "q6",
    question: "Do you offer refunds?",
    answer:
      "Yes. If your paid Premium Launch or Featured slot has not yet gone live and you wish to cancel, or if your submission is rejected by our editorial safety guidelines, we provide a 100% unconditional refund within 30 days. No questions asked.",
  },
];

export interface FAQSectionProps {
  onContactClick?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onContactClick }) => {
  const [openIds, setOpenIds] = useState<string[]>(["q1", "q2"]);

  const toggleFAQ = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="relative w-full max-w-[1240px] mx-auto px-6 py-12 md:py-[72px] space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="accent" size="sm" icon={<HelpCircle className="h-3 w-3" />}>
          FREQUENTLY ASKED QUESTIONS
        </Badge>
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-[-0.03em]">
          Everything you need to know
        </h2>
        <p className="text-base text-[#55556E] leading-relaxed">
          Clear answers about launches, voting mechanics, editorial backlink indexing, and refund policies.
        </p>
      </div>

      {/* Two-Column Layout: Accordion (Left/Main) + Contact Card (Right/Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Accordion Column (8 Cols on LG) */}
        <div className="lg:col-span-8 space-y-3.5">
          {FAQ_DATA.map((item) => {
            const isOpen = openIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                  isOpen
                    ? "border-[#4F46E5]/40 "
                    : "border-[#E6E6F0] hover:border-[#D4D4E4] "
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                >
                  <span className="font-heading font-bold text-base sm:text-lg text-[#14142B] pr-4">
                    {item.question}
                  </span>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                      isOpen
                        ? "bg-[#F7F6FF] text-[#4F46E5] rotate-180"
                        : "bg-[#F6F6FB] text-[#55556E]"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Animated Body */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-5 pt-1 sm:px-5 text-xs sm:text-sm text-[#52525A] leading-relaxed border-t border-[#E6E6F0]/50">
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Us Card (4 Cols on LG) */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="rounded-2xl border border-[#E6E6F0] bg-linear-to-b from-white to-[#F6F6FB] p-6 sm:p-7 space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#F7F6FF] text-[#4F46E5]">
              <MessageCircle className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                Still have questions?
              </h3>
              <p className="text-xs sm:text-sm text-[#55556E] leading-relaxed">
                Can't find the answer you're looking for? Reach out to our founder editorial team. We usually respond in under 2 hours.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                leftIcon={<Mail className="h-4 w-4" />}
                onClick={onContactClick}
              >
                Contact Editorial Team
              </Button>

              <div className="rounded-[10px] bg-white border border-[#E6E6F0] p-3 text-xs font-mono text-[#55556E] flex items-center justify-between">
                <span>Direct Support:</span>
                <span className="font-bold text-[#4F46E5]">team@launchos.com</span>
              </div>
            </div>

            <div className="border-t border-[#E6E6F0] pt-4 space-y-2 text-xs text-[#55556E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F8A5F]" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0F8A5F]" />
                <span>Verified human responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

