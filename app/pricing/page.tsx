// app/pricing/page.tsx
import type { Metadata } from 'next';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Container, SectionHeader } from '@/components/ui/container';
import { PricingTable } from '@/components/tiers/PricingTable';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Pricing — Launch Plans & Featured Tiers | ${siteConfig.name}`,
  description:
    'Choose your launch tier: Free listing forever, Featured placement for 14 days, or Premium Launch for guaranteed top spot and verified badge.',
};

const FAQS = [
  {
    q: 'Is the Free Listing really 100% free forever?',
    a: 'Yes, absolutely. Our Free tier allows any indie founder or startup team to submit their product, receive community upvotes, get indexed in /llms.txt for AI search, and earn a permanent product page without paying anything.',
  },
  {
    q: 'How does the tier-priority sorting work?',
    a: 'Listings are sorted strictly in order of Premium > Featured > Free, followed by real community upvotes and engagement. Premium products are pinned at the very top of daily launches and hero rails. Featured products enjoy top category positions and dedicated rails.',
  },
  {
    q: 'What happens when a Featured or Premium period expires?',
    a: 'Your listing automatically falls back to our Free tier. Your product page, upvotes, comments and dofollow backlink remain live forever. You can renew or upgrade your tier at any time from your Maker Dashboard.',
  },
  {
    q: 'Is a badge embed required for the backlink?',
    a: 'On the Free Launch plan, embedding our verification badge on your website is required to verify reciprocal dofollow indexing. On Featured and Premium Launch plans, your permanent dofollow backlink is activated immediately with zero badge requirement.',
  },
  {
    q: 'How does the /llms.txt AI feed help my startup?',
    a: 'Conversational AI models (ChatGPT, Perplexity, Gemini, Claude) crawl /llms.txt feeds to recommend verified software products to users looking for SaaS alternatives. Every approved startup is structured with JSON-LD and indexed automatically.',
  },
];

export default function PricingPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container className="space-y-16">
        <SectionHeader
          as="h1"
          align="center"
          eyebrow="Listing Plans"
          title="Simple, transparent tiers for every stage"
          description="Submit for free, or accelerate your traction with Featured spotlight rails and guaranteed Premium launch lineup."
        />

        {/* 3-Tier Cards + Comparison Matrix */}
        <PricingTable />

        {/* FAQ Accordion */}
        <section aria-labelledby="pricing-faq-heading" className="mx-auto max-w-3xl space-y-6 pt-4">
          <SectionHeader
            id="pricing-faq-heading"
            align="center"
            eyebrow="FAQ"
            title="Frequently asked questions"
          />
          <Accordion>
            {FAQS.map((faq, idx) => (
              <AccordionItem key={faq.q} question={faq.q} defaultOpen={idx === 0}>
                {faq.a}
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </Container>
    </main>
  );
}
