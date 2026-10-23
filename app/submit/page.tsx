// app/submit/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Tag,
  DollarSign,
  User,
  FileText,
  Loader2,
  AlertCircle,
  ImagePlus,
  UploadCloud,
  X,
  ChevronUp,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { submitStartupAction } from '@/actions/submit-startup';
import { uploadLogoAction } from '@/actions/upload-logo';
import { processLogo, hexToRgba, DEFAULT_BRAND_COLOR } from '@/lib/image-utils';
import StartupLogo from '@/components/StartupLogo';

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // raw input limit (compressed before upload)

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    websiteUrl: '',
    category: 'SaaS',
    pricingType: 'Freemium',
    description: '',
    twitterHandle: '',
    listingType: 'free',
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
      setErrorMessage('Sirf PNG, JPG, WEBP, SVG ya GIF logo upload karein.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setErrorMessage('Logo 5MB se chhota hona chahiye.');
      return;
    }
    try {
      setProcessingLogo(true);
      const processed = await processLogo(file);
      setLogoBlob(processed.blob);
      setLogoPreview(processed.previewUrl);
      setBrandColor(processed.brandColor);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Logo process nahi ho paya.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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

      setLoadingStep('Saving to database...');
      const res = await submitStartupAction({
        ...formData,
        logoUrl,
        brandColor: logoBlob ? brandColor : null,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Form submit nahi ho paya. Dobara koshish karein.');
      }
    } catch {
      setErrorMessage('Network error aaya. Kripya check karein.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Dynamic theme derived from the logo
  const brand = brandColor;
  const brandStyle = { '--brand': brand } as React.CSSProperties;
  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[var(--brand)] focus:bg-white/[0.07] transition-colors';

  if (submitted) {
    return (
      <main
        style={brandStyle}
        className="min-h-screen bg-[#070709] text-white flex items-center justify-center px-4 py-20 relative overflow-hidden font-sans"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[150px] pointer-events-none"
          style={{ background: hexToRgba(brand, 0.18) }}
        />

        <div className="max-w-md w-full bg-[#0d0d12] border border-white/10 rounded-3xl p-8 text-center space-y-6 relative z-10 shadow-2xl">
          {logoPreview ? (
            <div className="relative mx-auto w-20 h-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Startup logo"
                className="w-20 h-20 rounded-2xl bg-white object-contain p-2"
                style={{ boxShadow: `0 12px 40px -10px ${hexToRgba(brand, 0.6)}` }}
              />
              <span
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0d0d12]"
                style={{ background: brand }}
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
              </span>
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: hexToRgba(brand, 0.2), border: `1px solid ${hexToRgba(brand, 0.35)}`, color: brand }}
            >
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{formData.name || 'Startup'} is Live! 🎉</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aapka startup database me successfully save ho gaya hai aur ab Home, Directory aur{' '}
              <code style={{ color: brand }}>/llms.txt</code> feed par dikhega.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: brand }}>
              Next Step for Free Listing:
            </span>
            <p className="text-[11px] text-slate-300">
              Apni website par verification badge embed karein taaki reciprocal dofollow backlink verify ho sake.
            </p>
          </div>

          <Link
            href="/directory"
            className="inline-block w-full py-3 rounded-full font-bold text-xs text-white transition-all text-center hover:brightness-110"
            style={{
              background: `linear-gradient(90deg, ${brand}, ${hexToRgba(brand, 0.75)})`,
              boxShadow: `0 10px 30px -10px ${hexToRgba(brand, 0.6)}`,
            }}
          >
            Go to Directory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={brandStyle}
      className="min-h-screen bg-[#070709] text-white pt-8 pb-24 px-4 relative overflow-hidden font-sans"
    >
      {/* Background Glow (logo color se adapt hota hai) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] blur-[140px] pointer-events-none -z-10 transition-[background] duration-700"
        style={{ background: `radial-gradient(ellipse at top, ${hexToRgba(brand, 0.22)}, transparent 70%)` }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Page Header */}
        <div className="text-center mb-10 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-500"
            style={{ background: hexToRgba(brand, 0.1), border: `1px solid ${hexToRgba(brand, 0.25)}`, color: brand }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch On Vinay Startup Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Submit Your Indian Startup</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Get discovered by early adopters, acquire high DR dofollow backlinks, and enable automatic citation on AI
            search engines (ChatGPT, Perplexity, Gemini).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* ───────────── FORM ───────────── */}
          <div>
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl"
            >
              {/* Section 0: Logo */}
              <div className="space-y-4">
                <h3
                  className="text-xs font-bold uppercase tracking-wider border-b border-white/10 pb-2 transition-colors duration-500"
                  style={{ color: brand }}
                >
                  1. Startup Logo
                </h3>

                <input
                  ref={fileInputRef}
                  id="logo-upload-input"
                  type="file"
                  accept={ACCEPTED.join(',')}
                  className="hidden"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />

                {!logoPreview ? (
                  <div
                    id="logo-dropzone"
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
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
                    className={`group relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[var(--brand)] bg-white/[0.06] scale-[1.01]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                    }`}
                  >
                    {processingLogo ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: brand }} />
                        <p className="text-xs text-slate-400">Logo process ho raha hai, colors extract kar rahe hain...</p>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-translate-y-1"
                          style={{ background: hexToRgba(brand, 0.12), border: `1px solid ${hexToRgba(brand, 0.3)}` }}
                        >
                          <UploadCloud className="w-7 h-7" style={{ color: brand }} />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-semibold text-white">
                            Drag &amp; drop logo, ya <span style={{ color: brand }}>browse</span> karein
                          </p>
                          <p className="text-[11px] text-slate-500">
                            PNG, JPG, WEBP, SVG • Square (1:1) best • Max 5MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl transition-all duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${hexToRgba(brand, 0.12)}, ${hexToRgba(brand, 0.02)})`,
                      border: `1px solid ${hexToRgba(brand, 0.3)}`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-24 h-24 rounded-2xl bg-white object-contain p-2.5 shrink-0"
                      style={{ boxShadow: `0 12px 32px -10px ${hexToRgba(brand, 0.7)}` }}
                    />
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                          <ImagePlus className="w-4 h-4" style={{ color: brand }} /> Logo ready
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Is logo ke colors se aapke listing card ka theme set ho gaya hai.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <label
                          htmlFor="brand-color-input"
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10 cursor-pointer hover:border-white/25 transition-colors"
                          title="Brand color change karein"
                        >
                          <Palette className="w-3.5 h-3.5 text-slate-400" />
                          <span className="w-4 h-4 rounded-full border border-white/30" style={{ background: brand }} />
                          <span className="text-[11px] font-mono text-slate-300 uppercase">{brand}</span>
                          <input
                            id="brand-color-input"
                            type="color"
                            value={brand}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="sr-only"
                          />
                        </label>

                        <button
                          type="button"
                          id="change-logo-btn"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition-colors"
                          title="Logo change karein"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id="remove-logo-btn"
                          onClick={removeLogo}
                          className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
                          title="Logo hatayein"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3
                  className="text-xs font-bold uppercase tracking-wider border-b border-white/10 pb-2 transition-colors duration-500"
                  style={{ color: brand }}
                >
                  2. Basic Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="startup-name" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" style={{ color: brand }} /> Startup Name *
                    </label>
                    <input
                      id="startup-name"
                      type="text"
                      required
                      placeholder="e.g. BharatPay Analytics"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="startup-tagline" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: brand }} /> Tagline (One sentence) *
                    </label>
                    <input
                      id="startup-tagline"
                      type="text"
                      required
                      maxLength={90}
                      placeholder="e.g. Track UPI payments for B2B SaaS"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="startup-website" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" style={{ color: brand }} /> Website URL *
                    </label>
                    <input
                      id="startup-website"
                      type="url"
                      required
                      placeholder="https://yourstartup.com"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="startup-twitter" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" style={{ color: brand }} /> Founder Twitter/X Handle
                    </label>
                    <input
                      id="startup-twitter"
                      type="text"
                      placeholder="@founder_handle"
                      value={formData.twitterHandle}
                      onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Classification */}
              <div className="space-y-4">
                <h3
                  className="text-xs font-bold uppercase tracking-wider border-b border-white/10 pb-2 transition-colors duration-500"
                  style={{ color: brand }}
                >
                  3. Classification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="startup-category" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" style={{ color: brand }} /> Category *
                    </label>
                    <select
                      id="startup-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${inputClass} bg-[#121218]`}
                    >
                      <option value="SaaS">SaaS Tools</option>
                      <option value="AI">AI &amp; Machine Learning</option>
                      <option value="Fintech">Fintech &amp; UPI</option>
                      <option value="DevTools">Developer Tools</option>
                      <option value="Marketing">Marketing &amp; SEO</option>
                      <option value="Productivity">Productivity</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="startup-pricing" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" style={{ color: brand }} /> Pricing Model *
                    </label>
                    <select
                      id="startup-pricing"
                      value={formData.pricingType}
                      onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                      className={`${inputClass} bg-[#121218]`}
                    >
                      <option value="Free">Free</option>
                      <option value="Freemium">Freemium</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="startup-description" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" style={{ color: brand }} /> Description *
                  </label>
                  <textarea
                    id="startup-description"
                    rows={4}
                    required
                    placeholder="Briefly explain what your product does, problems it solves, key features..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Section 3: Select Plan */}
              <div className="space-y-4">
                <h3
                  className="text-xs font-bold uppercase tracking-wider border-b border-white/10 pb-2 transition-colors duration-500"
                  style={{ color: brand }}
                >
                  4. Select Launch Plan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'free',
                      title: 'Free Launch',
                      price: '₹0',
                      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                      desc: 'Standard review queue. Badge embed required on your website to verify reciprocal backlink.',
                    },
                    {
                      id: 'premium',
                      title: 'Instant Boost',
                      price: '₹999',
                      icon: <Zap className="w-4 h-4 text-amber-400" />,
                      desc: 'Instant auto-approval, featured status, immediate indexation without badge embed requirement.',
                    },
                  ].map((plan) => {
                    const active = formData.listingType === plan.id;
                    return (
                      <div
                        key={plan.id}
                        id={`plan-${plan.id}`}
                        onClick={() => setFormData({ ...formData, listingType: plan.id })}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          active ? '' : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        style={active ? { background: hexToRgba(brand, 0.1), borderColor: brand } : undefined}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            {plan.icon} {plan.title}
                          </span>
                          <span className="text-xs font-extrabold" style={{ color: active ? brand : undefined }}>
                            {plan.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{plan.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-startup-btn"
                type="submit"
                disabled={loading || processingLogo}
                className="w-full py-4 rounded-full text-white font-bold text-sm hover:scale-[1.01] hover:brightness-110 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(90deg, ${brand}, ${hexToRgba(brand, 0.75)}, ${brand})`,
                  boxShadow: `0 16px 40px -12px ${hexToRgba(brand, 0.65)}`,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingStep || 'Saving...'}</span>
                  </>
                ) : (
                  <span>Submit Startup Now 🚀</span>
                )}
              </button>
            </form>
          </div>

          {/* ───────────── LIVE PREVIEW ───────────── */}
          <aside className="lg:sticky lg:top-8 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: brand }} />
              Live Preview
            </p>

            <div
              className="relative overflow-hidden rounded-3xl p-5 bg-[#0d0d12] transition-all duration-500"
              style={{
                border: `1px solid ${hexToRgba(brand, 0.35)}`,
                boxShadow: `0 20px 60px -20px ${hexToRgba(brand, 0.45)}`,
              }}
            >
              {/* Banner tinted by logo color */}
              <div
                className="absolute inset-x-0 top-0 h-24 transition-all duration-500"
                style={{ background: `linear-gradient(180deg, ${hexToRgba(brand, 0.35)}, transparent)` }}
              />

              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-3 pt-6">
                  <StartupLogo
                    name={formData.name || 'Startup'}
                    logoUrl={logoPreview}
                    websiteUrl={formData.websiteUrl}
                    brandColor={brand}
                    size={64}
                    className="ring-4 ring-[#0d0d12]"
                  />

                  {formData.listingType === 'premium' && (
                    <span
                      className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full"
                      style={{ background: hexToRgba(brand, 0.2), color: brand, border: `1px solid ${hexToRgba(brand, 0.35)}` }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-white truncate">{formData.name || 'Your Startup Name'}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {formData.tagline || 'Aapki one-line tagline yahan dikhegi.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-1 rounded-md" style={{ background: hexToRgba(brand, 0.12), color: brand }}>
                      {formData.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md">
                      {formData.pricingType}
                    </span>
                  </div>
                  <span
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: hexToRgba(brand, 0.12), border: `1px solid ${hexToRgba(brand, 0.35)}` }}
                  >
                    <ChevronUp className="w-3.5 h-3.5" style={{ color: brand }} /> 1
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 Tip: Transparent background wala square logo sabse accha dikhta hai. Theme color logo se automatically
              pick hota hai — chahein toh palette se change kar sakte hain.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}