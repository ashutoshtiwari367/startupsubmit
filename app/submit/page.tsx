// app/submit/page.tsx
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  Crown,
  Loader2,
  Palette,
  RefreshCw,
  UploadCloud,
  X,
} from 'lucide-react';
import { submitStartupAction } from '@/actions/submit-startup';
import { uploadLogoAction } from '@/actions/upload-logo';
import { DEFAULT_BRAND_COLOR, processLogo } from '@/lib/image-utils';
import { cleanDomain, pricingTone } from '@/lib/format';
import StartupLogo from '@/components/StartupLogo';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, SectionHeader } from '@/components/ui/container';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { PlanCard } from '@/components/tiers/PlanCard';
import { TierBadge } from '@/components/tiers/TierBadge';
import { tierConfig } from '@/lib/site-config';
import type { ListingTier } from '@/lib/type';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

type FieldErrors = Partial<Record<'name' | 'tagline' | 'websiteUrl' | 'description', string>>;

function SubmitForm() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const requestedPlan = searchParams.get('plan') as ListingTier | null;
  const initialTier: ListingTier =
    requestedPlan === 'premium' || requestedPlan === 'featured' ? requestedPlan : 'free';

  const [submitted, setSubmitted] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Logo state
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string>(DEFAULT_BRAND_COLOR);
  const [processingLogo, setProcessingLogo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    websiteUrl: initialUrl,
    category: 'SaaS',
    pricingType: 'Freemium',
    description: '',
    twitterHandle: '',
    listingType: initialTier,
    bannerTitle: '',
    bannerImage: '',
  });

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoFile = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage('');
    if (!ACCEPTED.includes(file.type)) {
      setErrorMessage('Please upload a PNG, JPG, WEBP, SVG or GIF logo.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMessage('Logo must be smaller than 5 MB.');
      return;
    }
    try {
      setProcessingLogo(true);
      const processed = await processLogo(file);
      setLogoBlob(processed.blob);
      setLogoPreview(processed.previewUrl);
      setBrandColor(processed.brandColor);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not process logo.');
    } finally {
      setProcessingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoBlob(null);
    setLogoPreview(null);
    setBrandColor(DEFAULT_BRAND_COLOR);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!formData.name.trim()) next.name = 'Enter your product name.';
    if (!formData.tagline.trim()) next.tagline = 'Add a short one-line tagline.';
    if (!formData.websiteUrl.trim()) {
      next.websiteUrl = 'Enter your website URL.';
    } else if (!/^https?:\/\/.+\..+/i.test(formData.websiteUrl.trim())) {
      next.websiteUrl = 'Include https:// (e.g. https://yourstartup.com).';
    }
    if (!formData.description.trim()) {
      next.description = 'Describe what your product does.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      let logoUrl: string | null = null;

      if (logoBlob) {
        setLoadingStep('Uploading logo...');
        const fd = new FormData();
        fd.append('logo', new File([logoBlob], 'logo.webp', { type: 'image/webp' }));
        const up = await uploadLogoAction(fd);
        if (!up.success) {
          setErrorMessage(up.error);
          return;
        }
        logoUrl = up.url;
      }

      setLoadingStep('Publishing listing...');
      const res = await submitStartupAction({
        ...formData,
        logoUrl,
        brandColor: logoBlob ? brandColor : null,
      });

      if (res.success && res.data) {
        const row = res.data as { slug?: string };
        const slug = row.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        setCreatedSlug(slug);

        // Store maker's submitted startup into localStorage for dashboard & ownership tracking
        try {
          const raw = localStorage.getItem('my_startups') || '[]';
          const list = JSON.parse(raw);
          if (Array.isArray(list) && !list.includes(slug)) {
            list.unshift(slug);
            localStorage.setItem('my_startups', JSON.stringify(list));
          }
        } catch {
          // ignore localStorage issues
        }

        toast.add({
          type: 'success',
          title: `${formData.name} is live!`,
          description: `Your product is now listed on the leaderboard under the ${tierConfig[formData.listingType].name} plan.`,
        });
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Could not submit your product. Please try again.');
      }
    } catch {
      setErrorMessage('Network error while submitting. Please check your connection.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (submitted) {
    const selectedPlan = tierConfig[formData.listingType];
    return (
      <main className="py-16 sm:py-24">
        <Container className="max-w-lg">
          <Card className="p-8 text-center space-y-6 shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success-soft text-success">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-h2">{formData.name || 'Your startup'} is live!</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Your listing has been submitted under the{' '}
                <strong className="text-foreground">{selectedPlan.name}</strong> tier and is
                now active across the platform.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-subtle p-4 text-left space-y-1">
              <p className="text-xs font-semibold text-foreground">
                {formData.listingType === 'free'
                  ? 'Embed your badge for reciprocal dofollow'
                  : 'Fast-track priority status active'}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {formData.listingType === 'free'
                  ? 'Grab the launch badge HTML from your product profile to verify your reciprocal dofollow backlink.'
                  : `Your ${selectedPlan.name} status is activated. Your product receives priority positioning across rails and sidebars.`}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {createdSlug && (
                <Link
                  href={`/products/${createdSlug}`}
                  className={buttonVariants({ variant: 'primary', size: 'md', className: 'flex-1' })}
                >
                  View Product Page
                </Link>
              )}
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: 'secondary', size: 'md', className: 'flex-1' })}
              >
                Maker Dashboard
              </Link>
            </div>
          </Card>
        </Container>
      </main>
    );
  }

  const previewDomain = cleanDomain(formData.websiteUrl) || 'yourstartup.com';

  return (
    <main className="py-10 sm:py-14">
      <Container className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to launches</span>
        </Link>

        <SectionHeader
          as="h1"
          eyebrow="Submit a product"
          title="Launch your startup"
          description="Get discovered by founders and early adopters, earn a permanent dofollow backlink and get indexed in /llms.txt for AI search."
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-8">
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-xs font-medium text-destructive"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              {/* 1. Logo */}
              <fieldset className="space-y-4">
                <legend className="text-h4">1. Product logo</legend>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="logo-upload-input"
                  accept={ACCEPTED.join(',')}
                  className="sr-only"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />

                {!logoPreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handleLogoFile(e.dataTransfer.files?.[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={
                      dragActive
                        ? 'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary-soft/50 p-8 text-center transition-colors'
                        : 'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-subtle p-8 text-center hover:border-border-strong hover:bg-card transition-colors'
                    }
                  >
                    <div className="flex size-11 items-center justify-center rounded-xl bg-card border border-border text-primary shadow-xs">
                      {processingLogo ? (
                        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <UploadCloud className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {processingLogo ? 'Processing logo...' : 'Click to upload logo or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, SVG or GIF (max 5 MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-border bg-card p-2 shadow-xs"
                        style={{ borderColor: brandColor }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="size-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">Logo processed</p>
                        <p className="text-[11px] text-muted-foreground">
                          Auto-centered and normalized.
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
                          <Palette className="size-3 text-muted-foreground" aria-hidden="true" />
                          <span>Brand accent:</span>
                          <span
                            className="inline-block size-3.5 rounded-full border border-border"
                            style={{ backgroundColor: brandColor }}
                            aria-label={`Color ${brandColor}`}
                          />
                          <code className="font-mono text-[11px] text-foreground">{brandColor}</code>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="xs"
                        id="replace-logo-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <RefreshCw className="size-3" aria-hidden="true" />
                        <span>Replace</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        id="remove-logo-btn"
                        onClick={removeLogo}
                      >
                        <X className="size-3" aria-hidden="true" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                )}
              </fieldset>

              {/* 2. Basic details */}
              <fieldset className="space-y-4 border-t border-border pt-6">
                <legend className="text-h4">2. Product details</legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="startup-name"
                    label="Startup name"
                    required
                    error={fieldErrors.name}
                  >
                    <Input
                      id="startup-name"
                      required
                      aria-invalid={Boolean(fieldErrors.name) || undefined}
                      placeholder="e.g. BharatPay Analytics"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                      }}
                    />
                  </Field>

                  <Field
                    id="startup-website"
                    label="Website URL"
                    required
                    error={fieldErrors.websiteUrl}
                  >
                    <Input
                      id="startup-website"
                      type="url"
                      required
                      aria-invalid={Boolean(fieldErrors.websiteUrl) || undefined}
                      placeholder="https://yourstartup.com"
                      value={formData.websiteUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, websiteUrl: e.target.value });
                        if (fieldErrors.websiteUrl)
                          setFieldErrors({ ...fieldErrors, websiteUrl: undefined });
                      }}
                    />
                  </Field>
                </div>

                <Field
                  id="startup-tagline"
                  label="One-line tagline"
                  required
                  counter={`${formData.tagline.length}/90`}
                  error={fieldErrors.tagline}
                >
                  <Input
                    id="startup-tagline"
                    required
                    maxLength={90}
                    aria-invalid={Boolean(fieldErrors.tagline) || undefined}
                    placeholder="e.g. Real-time UPI revenue analytics for B2B SaaS"
                    value={formData.tagline}
                    onChange={(e) => {
                      setFormData({ ...formData, tagline: e.target.value });
                      if (fieldErrors.tagline)
                        setFieldErrors({ ...fieldErrors, tagline: undefined });
                    }}
                  />
                </Field>

                <Field
                  id="startup-twitter"
                  label="Maker X (Twitter) handle"
                  hint="Optional — shown on your product page."
                >
                  <Input
                    id="startup-twitter"
                    placeholder="@founder"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                  />
                </Field>
              </fieldset>

              {/* 3. Classification & description */}
              <fieldset className="space-y-4 border-t border-border pt-6">
                <legend className="text-h4">3. Category &amp; description</legend>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field id="startup-category" label="Category" required>
                    <NativeSelect
                      id="startup-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="SaaS">SaaS Tools</option>
                      <option value="AI">AI &amp; Machine Learning</option>
                      <option value="Fintech">Fintech &amp; UPI</option>
                      <option value="DevTools">Developer Tools</option>
                      <option value="Marketing">Marketing &amp; SEO</option>
                      <option value="Productivity">Productivity</option>
                      <option value="E-Commerce">E-Commerce</option>
                    </NativeSelect>
                  </Field>

                  <Field id="startup-pricing" label="Pricing model" required>
                    <NativeSelect
                      id="startup-pricing"
                      value={formData.pricingType}
                      onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                    >
                      <option value="Free">Free</option>
                      <option value="Freemium">Freemium</option>
                      <option value="Paid">Paid</option>
                    </NativeSelect>
                  </Field>
                </div>

                <Field
                  id="startup-description"
                  label="Description"
                  required
                  error={fieldErrors.description}
                  hint="Explain what your product does, who it is for and key capabilities."
                >
                  <Textarea
                    id="startup-description"
                    rows={5}
                    required
                    aria-invalid={Boolean(fieldErrors.description) || undefined}
                    placeholder="What problem does your startup solve, how does it work, and what makes it different?"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (fieldErrors.description)
                        setFieldErrors({ ...fieldErrors, description: undefined });
                    }}
                  />
                </Field>
              </fieldset>

              {/* 4. Launch Tier Selection (Free, Featured, Premium) */}
              <fieldset className="space-y-4 border-t border-border pt-6">
                <div>
                  <legend className="text-h4">4. Choose your launch tier</legend>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Free listing is 100% free with no credit card required. Upgrade anytime for featured placement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['free', 'featured', 'premium'] as ListingTier[]).map((tierKey) => (
                    <PlanCard
                      key={tierKey}
                      tier={tierKey}
                      selected={formData.listingType === tierKey}
                      onSelect={() => setFormData({ ...formData, listingType: tierKey })}
                    />
                  ))}
                </div>

                {/* Optional Premium Sponsored Banner Details */}
                {formData.listingType === 'premium' && (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                      <Crown className="size-4 text-amber-600" aria-hidden="true" />
                      <span>Premium Sponsored Banner Options (Optional)</span>
                    </div>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                      Your listing qualifies for an in-list sponsored banner row on the homepage leaderboard.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field id="banner-title" label="Banner Callout / Promo Headline">
                        <Input
                          id="banner-title"
                          placeholder="e.g. Try our API free for 14 days"
                          value={formData.bannerTitle}
                          onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                        />
                      </Field>
                      <Field id="banner-image" label="Banner Image URL">
                        <Input
                          id="banner-image"
                          placeholder="https://..."
                          value={formData.bannerImage}
                          onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                )}
              </fieldset>

              <div className="border-t border-border pt-6 space-y-3">
                <Button
                  id="submit-startup-btn"
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={processingLogo}
                  className="w-full"
                >
                  <span>
                    {loading
                      ? loadingStep || 'Submitting...'
                      : formData.listingType === 'free'
                      ? 'Submit product (100% Free)'
                      : `Launch as ${tierConfig[formData.listingType].name} (${tierConfig[formData.listingType].priceDisplay})`}
                  </span>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {formData.listingType === 'free'
                    ? '100% Free · 1-click submit · No credit card required'
                    : `Instant activation enabled · ${tierConfig[formData.listingType].name} includes ${tierConfig[formData.listingType].period} placement`}
                </p>
              </div>
            </form>
          </div>

          {/* Live card preview */}
          <aside className="space-y-3 lg:sticky lg:top-24 lg:col-span-4">
            <p className="text-eyebrow text-muted-foreground">Live card preview</p>

            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <StartupLogo
                    name={formData.name || 'Startup'}
                    logoUrl={logoPreview}
                    websiteUrl={formData.websiteUrl}
                    size={48}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {formData.name || 'Your startup name'}
                      </h3>
                      <TierBadge
                        tier={formData.listingType}
                        isVerified={formData.listingType === 'premium'}
                        size="sm"
                      />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{previewDomain}</p>
                  </div>
                </div>

                <span className="flex h-12 min-w-11 flex-col items-center justify-center rounded-lg border border-border bg-subtle text-xs font-semibold text-foreground">
                  <ChevronUp className="size-3.5 text-primary" aria-hidden="true" />1
                </span>
              </div>

              <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                {formData.tagline || 'Your one-line value proposition appears here.'}
              </p>

              <div className="flex items-center gap-1.5 border-t border-border pt-3">
                <Badge variant="outline" size="sm">
                  {formData.category}
                </Badge>
                <Badge variant={pricingTone(formData.pricingType)} size="sm">
                  {formData.pricingType}
                </Badge>
              </div>
            </Card>

            <p className="text-xs leading-relaxed text-muted-foreground">
              Tip: A square (1:1) logo with a transparent or solid background looks crispest on the
              leaderboard.
            </p>
          </aside>
        </div>
      </Container>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      }
    >
      <SubmitForm />
    </Suspense>
  );
}
