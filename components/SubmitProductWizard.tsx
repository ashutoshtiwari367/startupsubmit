"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Tag,
  DollarSign,
  Award,
  ArrowBigUp,
  X,
  Share2,
  Mail,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import type { PricingModel, ListingStatus } from "@/types/db";

export interface SubmitFormData {
  name: string;
  tagline: string;
  description_short: string;
  description_long: string;
  website_url: string;
  category: string;
  pricing_model: PricingModel;
  submitted_by_email: string;
}

interface SubmittedListingResponse {
  id: string;
  name: string;
  slug: string;
  status: ListingStatus;
  category_id: string;
  pricing_model: PricingModel;
  website_url: string;
  logo_url: string;
  screenshots: string[];
  created_at: string;
}

const INITIAL_FORM: SubmitFormData = {
  name: "",
  tagline: "",
  description_short: "",
  description_long: "",
  website_url: "",
  category: "ai",
  pricing_model: "freemium",
  submitted_by_email: "",
};

const CATEGORIES = [
  { slug: "ai", label: "AI" },
  { slug: "productivity", label: "Productivity" },
  { slug: "marketing", label: "Marketing" },
  { slug: "developer-tools", label: "Developer Tools" },
  { slug: "design-ux", label: "Design & UX" },
  { slug: "saas-tools", label: "SaaS & Tools" },
  { slug: "analytics-data", label: "Analytics & Data" },
  { slug: "finance-fintech", label: "Finance & FinTech" },
  { slug: "video-content", label: "Video & Content" },
  { slug: "e-commerce", label: "E-commerce" },
];

const PRICING_OPTIONS: { value: PricingModel; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "one_time", label: "One-Time Payment" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SubmitProductWizard: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<SubmitFormData>(INITIAL_FORM);

  // Media file state (sent via multipart/form-data to /api/submit)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<SubmittedListingResponse | null>(null);
  const [emittedEventName, setEmittedEventName] = useState<string>("listing_submitted");
  const [copiedCode, setCopiedCode] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFieldChange = (field: keyof SubmitFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, logo: "Logo must be a valid image file." }));
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.logo;
      return next;
    });
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const combined = [...screenshotFiles, ...selected];
    if (combined.length > 5) {
      setErrors((prev) => ({
        ...prev,
        screenshots: "Maximum 5 screenshots allowed.",
      }));
      return;
    }

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          screenshots: "All screenshots must be valid image files.",
        }));
        return;
      }
    }

    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setScreenshotFiles(combined);
    setScreenshotPreviews((prev) => [...prev, ...newPreviews]);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.screenshots;
      return next;
    });
    if (screenshotsInputRef.current) {
      screenshotsInputRef.current.value = "";
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.screenshots;
      return next;
    });
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tool name is required.";
    }

    if (!formData.tagline.trim()) {
      newErrors.tagline = "Tagline is required.";
    } else if (formData.tagline.trim().length > 60) {
      newErrors.tagline = "Tagline cannot exceed 60 characters.";
    }

    if (!formData.description_short.trim()) {
      newErrors.description_short = "Short description is required.";
    } else if (formData.description_short.trim().length > 250) {
      newErrors.description_short = "Short description cannot exceed 250 characters.";
    }

    if (!formData.description_long.trim()) {
      newErrors.description_long = "Long description is required.";
    } else if (formData.description_long.trim().length > 2000) {
      newErrors.description_long = "Long description cannot exceed 2,000 characters.";
    }

    if (!formData.website_url.trim()) {
      newErrors.website_url = "Website URL is required.";
    } else {
      try {
        const parsed = new URL(formData.website_url.trim());
        if (parsed.protocol !== "https:") {
          newErrors.website_url = "Website URL must use HTTPS (https://).";
        }
      } catch {
        newErrors.website_url = "Enter a valid HTTPS URL (e.g. https://writepro.ai).";
      }
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required.";
    }

    if (!formData.pricing_model.trim()) {
      newErrors.pricing_model = "Pricing model is required.";
    }

    if (!formData.submitted_by_email.trim()) {
      newErrors.submitted_by_email = "Submitter email is required.";
    } else if (!EMAIL_REGEX.test(formData.submitted_by_email.trim())) {
      newErrors.submitted_by_email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!logoFile) {
      newErrors.logo = "Logo image is required.";
    }
    if (screenshotFiles.length > 5) {
      newErrors.screenshots = "Maximum 5 screenshots allowed.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalSubmit = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("tagline", formData.tagline.trim());
      payload.append("description_short", formData.description_short.trim());
      payload.append("description_long", formData.description_long.trim());
      payload.append("website_url", formData.website_url.trim());
      payload.append("category", formData.category.trim());
      payload.append("pricing_model", formData.pricing_model.trim());
      payload.append("submitted_by_email", formData.submitted_by_email.trim());

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      for (const file of screenshotFiles) {
        payload.append("screenshots", file);
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.errors && typeof data.errors === "object") {
          setErrors(data.errors);
          if (
            data.errors.name ||
            data.errors.tagline ||
            data.errors.description_short ||
            data.errors.description_long ||
            data.errors.website_url ||
            data.errors.category ||
            data.errors.pricing_model ||
            data.errors.submitted_by_email
          ) {
            setStep(1);
          } else if (data.errors.logo || data.errors.screenshots) {
            setStep(2);
          }
        }
        setServerError(data.message || "Submission failed. Please check your inputs.");
        setIsSubmitting(false);
        return;
      }

      setSubmittedResult(data.listing);
      if (data.event?.event_name) {
        setEmittedEventName(data.event.event_name);
      }
      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error while submitting.";
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) return;
      setStep(3);
    } else if (step === 3) {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4 && !isSubmitting) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const resetForAnotherSubmission = () => {
    setFormData(INITIAL_FORM);
    setLogoFile(null);
    setLogoPreview("");
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
    setSubmittedResult(null);
    setServerError(null);
    setErrors({});
    setStep(1);
  };

  const finalSlug =
    submittedResult?.slug ||
    formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "your-tool";

  const selectedCategoryLabel =
    CATEGORIES.find((c) => c.slug === formData.category)?.label || formData.category;

  const selectedPricingLabel =
    PRICING_OPTIONS.find((p) => p.value === formData.pricing_model)?.label ||
    formData.pricing_model;

  const badgeEmbedSnippet = `<a href="https://launchos.com/product/${encodeURIComponent(
    finalSlug
  )}" target="_blank" rel="noopener noreferrer">
  <img src="https://api.launchos.com/badges/${encodeURIComponent(
    finalSlug
  )}.svg" alt="${formData.name || "Tool"} - Featured on LaunchOS" width="220" height="54" />
</a>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(badgeEmbedSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Navbar />

      <div className="max-w-[1240px] mx-auto px-6 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb & Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6F0] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/"
                className="text-xs font-mono text-[#55556E] hover:text-[#4F46E5] transition-colors flex items-center gap-1 font-semibold"
              >
                <span>&larr; Back to Directory</span>
              </Link>
              <span className="text-xs text-[#E6E6F0]">•</span>
              <span className="text-xs font-mono font-bold text-[#4F46E5]">Public Submit Form</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#14142B] tracking-[-0.03em]">
              Submit Your Tool
            </h1>
            <p className="mt-1.5 text-base text-[#55556E] leading-relaxed">
              No login required. Submit your software or AI tool for admin review and directory listing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#E6E6F0] bg-white px-3.5 py-1.5 text-xs font-mono text-[#55556E]">
              <ShieldCheck className="h-4 w-4 text-[#0F8A5F]" />
              <span>Reviewed by Admin Before Publishing</span>
            </div>
          </div>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#DC2626]">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Submission Error</span>
              <span>{serverError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="text-[#DC2626] hover:opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 3-STEP PROGRESS BAR */}
        {step < 4 && (
          <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 sm:gap-3 p-2 rounded-[10px] transition-all text-left ${
                  step === 1
                    ? "bg-[#F7F6FF] text-[#4F46E5]"
                    : step > 1
                    ? "text-[#0F8A5F] hover:bg-[#F6F6FB]"
                    : "text-[#55556E] opacity-60"
                }`}
              >
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step === 1
                      ? "bg-[#4F46E5] text-white "
                      : step > 1
                      ? "bg-[#0F8A5F] text-white"
                      : "bg-[#E6E6F0] text-[#55556E]"
                  }`}
                >
                  {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-semibold">Step 1</div>
                  <div className="text-xs sm:text-sm font-heading font-bold truncate">Tool Details</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className={`flex items-center gap-2 sm:gap-3 p-2 rounded-[10px] transition-all text-left ${
                  step === 2
                    ? "bg-[#F7F6FF] text-[#4F46E5]"
                    : step > 2
                    ? "text-[#0F8A5F] hover:bg-[#F6F6FB]"
                    : "text-[#55556E] opacity-60"
                }`}
              >
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step === 2
                      ? "bg-[#4F46E5] text-white "
                      : step > 2
                      ? "bg-[#0F8A5F] text-white"
                      : "bg-[#E6E6F0] text-[#55556E]"
                  }`}
                >
                  {step > 2 ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-semibold">Step 2</div>
                  <div className="text-xs sm:text-sm font-heading font-bold truncate">Logo & Screenshots</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1() && validateStep2()) setStep(3);
                }}
                className={`flex items-center gap-2 sm:gap-3 p-2 rounded-[10px] transition-all text-left ${
                  step === 3 ? "bg-[#F7F6FF] text-[#4F46E5]" : "text-[#55556E] opacity-60"
                }`}
              >
                <div
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step === 3 ? "bg-[#4F46E5] text-white " : "bg-[#E6E6F0] text-[#55556E]"
                  }`}
                >
                  3
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-mono uppercase tracking-wider font-semibold">Step 3</div>
                  <div className="text-xs sm:text-sm font-heading font-bold truncate">Review & Submit</div>
                </div>
              </button>
            </div>

            <div className="w-full bg-[#E6E6F0] h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-[#4F46E5] h-full transition-all duration-300 rounded-full"
                style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* MAIN WIZARD BODY */}
        {step < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: FORM INPUTS (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: TOOL DETAILS */}
              {step === 1 && (
                <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6E6F0] pb-4">
                    <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                      Step 1: Tool Information
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E]">
                      Provide your tool's name, descriptions, HTTPS website URL, category, pricing, and email.
                    </p>
                  </div>

                  {/* 1. Name (Required) */}
                  <div>
                    <label className="block text-xs font-bold text-[#14142B] mb-1.5">
                      Tool Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <Input
                      placeholder="e.g. WritePro"
                      value={formData.name}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      error={errors.name}
                    />
                  </div>

                  {/* 2. Tagline (Max 60 characters) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#14142B]">
                        Tagline (Short Headline) <span className="text-[#DC2626]">*</span>
                      </label>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          formData.tagline.length > 60
                            ? "text-[#DC2626]"
                            : formData.tagline.length > 50
                            ? "text-[#EA580C]"
                            : "text-[#55556E]"
                        }`}
                      >
                        {formData.tagline.length}/60
                      </span>
                    </div>
                    <Input
                      placeholder="e.g. AI writing assistant for fast marketing copy"
                      value={formData.tagline}
                      onChange={(e) => handleFieldChange("tagline", e.target.value)}
                      error={errors.tagline}
                    />
                    <span className="text-[11px] text-[#55556E] mt-1 block">
                      Maximum 60 characters.
                    </span>
                  </div>

                  {/* 3. Website URL (HTTPS only) */}
                  <div>
                    <label className="block text-xs font-bold text-[#14142B] mb-1.5">
                      Website URL (HTTPS Only) <span className="text-[#DC2626]">*</span>
                    </label>
                    <Input
                      placeholder="https://writepro.ai"
                      value={formData.website_url}
                      onChange={(e) => handleFieldChange("website_url", e.target.value)}
                      leftIcon={<Globe className="h-4 w-4" />}
                      error={errors.website_url}
                    />
                    <span className="text-[11px] text-[#55556E] mt-1 block">
                      Must start with https:// (plain http:// links are rejected).
                    </span>
                  </div>

                  {/* 4. Short Description (Max 250 characters) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#14142B]">
                        Short Description <span className="text-[#DC2626]">*</span>
                      </label>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          formData.description_short.length > 250
                            ? "text-[#DC2626]"
                            : formData.description_short.length > 220
                            ? "text-[#EA580C]"
                            : "text-[#55556E]"
                        }`}
                      >
                        {formData.description_short.length}/250
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.description_short}
                      onChange={(e) => handleFieldChange("description_short", e.target.value)}
                      placeholder="Brief introduction to your tool (up to 250 characters)..."
                      className={`w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                        errors.description_short
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#E6E6F0] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
                      }`}
                    />
                    {errors.description_short && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {errors.description_short}
                      </p>
                    )}
                  </div>

                  {/* 5. Long Description (Max 2,000 characters) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#14142B]">
                        Long Description <span className="text-[#DC2626]">*</span>
                      </label>
                      <span
                        className={`text-xs font-mono font-semibold ${
                          formData.description_long.length > 2000
                            ? "text-[#DC2626]"
                            : formData.description_long.length > 1800
                            ? "text-[#EA580C]"
                            : "text-[#55556E]"
                        }`}
                      >
                        {formData.description_long.length}/2000
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.description_long}
                      onChange={(e) => handleFieldChange("description_long", e.target.value)}
                      placeholder="Complete tool details, key features, use cases, and how it helps users (up to 2,000 characters)..."
                      className={`w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                        errors.description_long
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#E6E6F0] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20"
                      }`}
                    />
                    {errors.description_long && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {errors.description_long}
                      </p>
                    )}
                  </div>

                  {/* 6 & 7. Category & Pricing Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#14142B] mb-1.5">
                        Category <span className="text-[#DC2626]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.category}
                          onChange={(e) => handleFieldChange("category", e.target.value)}
                          className="w-full appearance-none rounded-[10px] border border-[#E6E6F0] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556E] pointer-events-none" />
                      </div>
                      {errors.category && (
                        <p className="mt-1 text-xs font-medium text-[#DC2626]">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14142B] mb-1.5">
                        Pricing Model <span className="text-[#DC2626]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.pricing_model}
                          onChange={(e) =>
                            handleFieldChange("pricing_model", e.target.value as PricingModel)
                          }
                          className="w-full appearance-none rounded-[10px] border border-[#E6E6F0] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#14142B] focus:border-[#4F46E5] focus:outline-none"
                        >
                          {PRICING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556E] pointer-events-none" />
                      </div>
                      {errors.pricing_model && (
                        <p className="mt-1 text-xs font-medium text-[#DC2626]">
                          {errors.pricing_model}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 8. Submitter Email */}
                  <div className="border-t border-[#E6E6F0] pt-4">
                    <label className="block text-xs font-bold text-[#14142B] mb-1.5">
                      Submitter Email <span className="text-[#DC2626]">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="maker@writepro.ai"
                      value={formData.submitted_by_email}
                      onChange={(e) => handleFieldChange("submitted_by_email", e.target.value)}
                      error={errors.submitted_by_email}
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                    <span className="text-[11px] text-[#55556E] mt-1 block">
                      We'll notify this email once your listing is reviewed and approved.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 2: LOGO & SCREENSHOTS (MAX 5) */}
              {step === 2 && (
                <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6E6F0] pb-4">
                    <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                      Step 2: Tool Logo & Screenshots
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E]">
                      Upload your tool's logo (required) and up to 5 product screenshots. Files are securely uploaded via our backend API.
                    </p>
                  </div>

                  {/* 9. Logo Upload (Required) */}
                  <div>
                    <label className="block text-xs font-bold text-[#14142B] mb-2">
                      Tool Logo <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-[12px] border border-[#E6E6F0] bg-[#F6F6FB] overflow-hidden shrink-0 flex items-center justify-center">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-[#55556E]" />
                        )}
                      </div>

                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className={`w-full rounded-[12px] border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                          errors.logo
                            ? "border-[#DC2626] bg-[#FEF2F2]"
                            : "border-[#D4D4E4] hover:border-[#4F46E5] bg-[#F6F6FB]"
                        }`}
                      >
                        <UploadCloud className="h-5 w-5 text-[#4F46E5] mx-auto mb-1" />
                        <span className="text-xs font-semibold text-[#14142B] block">
                          {logoFile ? logoFile.name : "Click to select tool logo image"}
                        </span>
                        <span className="text-[10px] text-[#55556E]">
                          PNG, JPG, SVG or WebP (Max 5MB)
                        </span>
                      </div>
                    </div>
                    {errors.logo && (
                      <p className="mt-1.5 text-xs font-medium text-[#DC2626]">{errors.logo}</p>
                    )}
                  </div>

                  {/* 10. Screenshots Upload (Maximum 5) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#14142B]">
                        Product Screenshots (Maximum 5)
                      </label>
                      <span className="text-xs font-mono font-semibold text-[#55556E]">
                        {screenshotFiles.length}/5 uploaded
                      </span>
                    </div>

                    <input
                      ref={screenshotsInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      multiple
                      onChange={handleScreenshotsChange}
                      className="hidden"
                    />

                    {screenshotFiles.length < 5 && (
                      <div
                        onClick={() => screenshotsInputRef.current?.click()}
                        className={`rounded-[12px] border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                          errors.screenshots
                            ? "border-[#DC2626] bg-[#FEF2F2]"
                            : "border-[#D4D4E4] hover:border-[#4F46E5] bg-[#F6F6FB]"
                        }`}
                      >
                        <UploadCloud className="h-7 w-7 text-[#4F46E5] mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-[#14142B] block">
                          Click to upload screenshots ({5 - screenshotFiles.length} remaining)
                        </span>
                        <span className="text-[11px] text-[#55556E]">
                          Saved in listing_screenshots with ordered position (0..4)
                        </span>
                      </div>
                    )}

                    {errors.screenshots && (
                      <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                        {errors.screenshots}
                      </p>
                    )}

                    {screenshotPreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {screenshotPreviews.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-[10px] border border-[#E6E6F0] overflow-hidden bg-[#F6F6FB] aspect-video"
                          >
                            <img
                              src={src}
                              alt={`Screenshot ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeScreenshot(idx)}
                              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#14142B]/80 text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                              title="Remove screenshot"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <span className="absolute bottom-1.5 left-1.5 rounded bg-[#14142B]/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                              pos: {idx}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & SUBMIT */}
              {step === 3 && (
                <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-[#E6E6F0] pb-4">
                    <h2 className="font-heading font-extrabold text-xl text-[#14142B] tracking-tight">
                      Step 3: Review & Submit for Approval
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E]">
                      Verify your tool details below. After submission, your listing will be saved with{" "}
                      <span className="font-mono font-bold text-[#14142B]">pending</span> status for admin review.
                    </p>
                  </div>

                  {/* Summary Table */}
                  <div className="rounded-[12px] border border-[#E6E6F0] bg-[#F6F6FB] p-4 space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Tool Name:</span>
                      <span className="font-bold text-[#14142B]">{formData.name}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Tagline ({formData.tagline.length}/60):</span>
                      <span className="font-medium text-[#14142B] text-right">{formData.tagline}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Website URL:</span>
                      <span className="font-mono text-[#4F46E5] break-all">{formData.website_url}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Category & Pricing:</span>
                      <span className="font-semibold text-[#14142B]">
                        {selectedCategoryLabel} • {selectedPricingLabel} ({formData.pricing_model})
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Submitter Email:</span>
                      <span className="font-mono text-[#14142B]">{formData.submitted_by_email}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E6E6F0] pb-2">
                      <span className="text-[#55556E] font-medium">Media Attached:</span>
                      <span className="font-semibold text-[#0F8A5F]">
                        1 Logo + {screenshotFiles.length} Screenshot(s)
                      </span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[#55556E] font-medium block mb-1">
                        Short Description ({formData.description_short.length}/250):
                      </span>
                      <p className="text-xs text-[#14142B] bg-white p-2.5 rounded-[10px] border border-[#E6E6F0]">
                        {formData.description_short}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[10px] bg-[#F7F6FF]/60 border border-[#E0DEFC] p-3.5 text-xs text-[#55556E] flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-[#4F46E5] shrink-0" />
                    <span>
                      Submitted tools enter the database with <strong>pending</strong> status and will only appear in the public directory after admin approval.
                    </span>
                  </div>
                </div>
              )}

              {/* ACTION FOOTER BUTTONS */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Back
                  </Button>
                ) : (
                  <Link href="/">
                    <Button variant="ghost" size="md">
                      Cancel
                    </Button>
                  </Link>
                )}

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  rightIcon={
                    isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )
                  }
                  className="font-bold"
                >
                  {isSubmitting
                    ? "Submitting Tool..."
                    : step === 3
                    ? "Submit Tool for Review"
                    : "Continue to Next Step"}
                </Button>
              </div>
            </div>

            {/* RIGHT: DYNAMIC LIVE PREVIEW CARD (5 COLS) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#55556E]">
                  Live Directory Card Preview
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#0F8A5F]">
                  <span className="h-2 w-2 rounded-full bg-[#0F8A5F] animate-pulse" />
                  Live Preview
                </span>
              </div>

              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-[12px] bg-linear-to-br from-[#F7F6FF] to-[#E0DEFC] border border-[#E0DEFC] overflow-hidden shrink-0 flex items-center justify-center font-heading font-extrabold text-base text-[#4F46E5]">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt={formData.name || "Logo"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (formData.name || "TL").slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#14142B] tracking-tight">
                          {formData.name || "Your Tool Name"}
                        </h3>
                        <span className="rounded-full bg-[#FFF1D6] text-[#7A4E00] px-2 py-0.5 text-[10px] font-mono font-bold">
                          pending
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#55556E]">
                        <span className="font-mono text-[11px] text-[#4F46E5]">
                          /{finalSlug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#E6E6F0] bg-[#F6F6FB] px-3 py-1.5">
                    <ArrowBigUp className="h-4 w-4 text-[#4F46E5] fill-current" />
                    <span className="font-mono text-xs font-bold text-[#14142B]">1</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[#14142B] line-clamp-2 leading-relaxed">
                  {formData.tagline || "Your 60-character tagline will appear here..."}
                </p>

                {formData.description_short && (
                  <p className="text-xs text-[#55556E] line-clamp-3 leading-relaxed">
                    {formData.description_short}
                  </p>
                )}

                {screenshotPreviews.length > 0 && (
                  <div className="h-28 w-full rounded-[10px] overflow-hidden border border-[#E6E6F0] bg-[#F6F6FB]">
                    <img
                      src={screenshotPreviews[0]}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-[#E6E6F0]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.5 text-[10px] font-semibold text-[#55556E]">
                      {selectedCategoryLabel}
                    </span>
                    <span className="rounded-full bg-[#F6F6FB] border border-[#E6E6F0] px-2 py-0.5 text-[10px] font-semibold text-[#55556E]">
                      {selectedPricingLabel}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-[#55556E] flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {screenshotFiles.length}/5 Screenshots
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 4: SUCCESS CONFIRMATION SCREEN */
          <div className="max-w-2xl mx-auto rounded-[20px] border border-[#E6E6F0] bg-white p-6 sm:p-10 text-center space-y-7 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F8A5F] border-4 border-[#A7F3D0]">
              <Sparkles className="h-9 w-9 text-[#0F8A5F]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#0F8A5F]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved in Database • Status: Pending Review
              </span>
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-tight">
                {submittedResult?.name || formData.name} has been submitted!
              </h2>
              <p className="text-sm text-[#55556E] max-w-md mx-auto">
                Your tool is safely stored with <strong className="text-[#14142B]">pending</strong> status. Our admin team will review it and publish it to the directory once approved.
              </p>
            </div>

            {/* Database Record Summary Box */}
            <div className="rounded-2xl bg-[#F6F6FB] border border-[#E6E6F0] p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#55556E]">Database Record UUID:</span>
                <span className="font-mono font-bold text-[#14142B]">
                  {submittedResult?.id ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Generated Unique Slug:</span>
                <span className="font-mono font-bold text-[#4F46E5]">
                  {submittedResult?.slug || finalSlug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Listing Status:</span>
                <span className="font-mono font-bold uppercase text-[#7A4E00] bg-[#FFF1D6] px-2 py-0.5 rounded">
                  {submittedResult?.status || "pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Pricing Model Enum:</span>
                <span className="font-mono font-bold text-[#14142B]">
                  {submittedResult?.pricing_model || formData.pricing_model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">System Event Emitted:</span>
                <span className="font-mono font-bold text-[#0F8A5F]">
                  {emittedEventName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Website URL:</span>
                <span className="font-mono text-[#4F46E5] truncate max-w-[240px]">
                  {submittedResult?.website_url || formData.website_url}
                </span>
              </div>
            </div>

            {/* EMBED CODE SNIPPET BOX */}
            <div className="rounded-2xl border border-[#E0DEFC] bg-[#F7F6FF] p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#4F46E5]" />
                  <span className="font-heading font-bold text-xs sm:text-sm text-[#14142B]">
                    Prepare your LaunchOS badge for launch day
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyEmbedCode}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] bg-white border border-[#E0DEFC] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <Check className="h-3.5 w-3.5 text-[#0F8A5F]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedCode ? "Copied!" : "Copy Code"}
                </button>
              </div>

              <pre className="text-[11px] font-mono text-[#55556E] bg-white p-3 rounded-[10px] border border-[#E6E6F0] overflow-x-auto select-all">
                {badgeEmbedSnippet}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full">
                  Return to Directory
                </Button>
              </Link>

              <Button
                variant="primary"
                size="md"
                onClick={resetForAnotherSubmission}
                className="w-full sm:w-auto font-bold"
                leftIcon={<Share2 className="h-4 w-4" />}
              >
                Submit Another Tool
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
