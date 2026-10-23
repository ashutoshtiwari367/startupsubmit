// app/pricing/page.tsx
import Link from 'next/link';
import { Check, Sparkles, Zap, Rocket, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Launch',
      price: '₹0',
      period: 'forever',
      description: 'Standard listing for early-stage builders and side-projects.',
      badge: 'Community',
      features: [
        'Standard review queue (3-5 days)',
        'Dofollow backlink (Badge embed required)',
        'Permanent profile on directory',
        'Direct outbound website link',
        'Indexed in /llms.txt AI feed',
      ],
      ctaText: 'Submit For Free',
      ctaLink: '/submit',
      popular: false,
      buttonStyle: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    },
    {
      name: 'Instant Boost',
      price: '₹999',
      period: 'one-time',
      description: 'Skip the line, fast-track approval, and featured spot on homepage.',
      badge: 'Most Popular',
      features: [
        'Guaranteed same-day approval (24 hours)',
        'Featured spot on Homepage for 7 days',
        'Permanent high DR dofollow backlink',
        'No backlink badge required on your site',
        'Priority formatting for ChatGPT & Perplexity',
        'Social shoutout on X (Twitter)',
      ],
      ctaText: 'Get Instant Boost',
      ctaLink: '/submit',
      popular: true,
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25',
    },
    {
      name: 'Growth Launcher',
      price: '₹3,999',
      period: 'one-time',
      description: 'Hands-off distribution across 100+ high authority SaaS directories.',
      badge: 'Founders Choice',
      features: [
        'Everything in Instant Boost',
        'Manual submission to 100+ vetted directories',
        'Full submission report with live URLs',
        'Boosted Domain Authority (DR 40+ to 80+)',
        'Save 40+ hours of repetitive manual work',
        'Dedicated founder support via WhatsApp',
      ],
      ctaText: 'Launch Across 100+ Sites',
      ctaLink: '/submit',
      popular: false,
      buttonStyle: 'bg-white/10 hover:bg-white/15 text-white border border-white/20',
    },
  ];

  const faqs = [
    {
      q: 'Dofollow backlink ke liye badge lagana zaroori hai?',
      a: 'Free plan me reciprocal backlink verification ke liye badge lagana mandatory hai. Agar aap Instant Boost plan choose karte hain, toh bina kisi badge ke instant permanent dofollow backlink milta hai.',
    },
    {
      q: 'AI Search Engines (/llms.txt) par listing kaise help karegi?',
      a: 'ChatGPT, Perplexity aur Gemini hamari standardized /llms.txt file ko continuously crawl karte hain. Listing hone se AI aapke tool ko relevant prompts par directly quote karega.',
    },
    {
      q: 'Review time kitna lagta hai?',
      a: 'Free listings 3-5 business days me review hoti hain. Instant Boost submissions 24 ghante ke andar live kar di jaati hain.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#070709] text-white pt-8 pb-24 px-4 font-sans relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-orange-600/15 via-amber-600/5 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Boost Visibility, Traffic & Domain Authority
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to launch your Indian SaaS product and rank higher on both Google and conversational AI crawlers.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl p-8 transition-all relative ${
                plan.popular
                  ? 'bg-[#0f0f16] border-2 border-orange-500 shadow-2xl shadow-orange-500/10 scale-105 z-10'
                  : 'bg-[#0d0d12] border border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-500/30">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500">/{plan.period}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">What's included:</span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.ctaLink}
                  className={`w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${plan.buttonStyle}`}
                >
                  {plan.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-12 border-t border-white/10">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-500" /> Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Got questions? We have got answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-white">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}