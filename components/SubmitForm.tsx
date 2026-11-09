"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Tag,
  DollarSign,
  ArrowBigUp,
  X,
  Mail,
  FileText,
  Clock,
  Loader2,
  Send,
  RefreshCw,
} from "lucide-react";
import { Button } from "./Button";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import {
  submitListingSchema,
  SubmitListingFormValues,
  SUBMIT_LIMITS,
} from "@/lib/schemas/submitListing";
import type { CategoryRow, PricingModel, ListingStatus } from "@/types/db";

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

const PRICING_OPTIONS: { value: PricingModel; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "one_time", label: "One-Time Payment" },
];

/**
 * Custom hook to fetch categories exclusively from our own GET /api/categories endpoint.
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch("/api/categories")
      .then(async (res) => {
        const json = await res.json();
        if (!active) return;
        if (!res.ok || !json.ok) {
          setError(json.message || "Failed to load categories");
        } else {
          setCategories(json.categories || []);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load categories"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading, error };
}

export const SubmitForm: React.FC = () => {
  const { categories, loading: loadingCategories, error: categoriesError } =
    useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitListingFormValues>({
    resolver: zodResolver(submitListingSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      tagline: "",
      description_short: "",
      description_long: "",
      website_url: "",
      category_id: "",
      pricing_model: "freemium",
      submitted_by_email: "",
      company_website_hp: "",
    },
  });

  // Auto-select first category once loaded from /api/categories
  const watchedCategoryId = watch("category_id");
  useEffect(() => {
    if (!watchedCategoryId && categories.length > 0) {
      setValue("category_id", categories[0].id, { shouldValidate: true });
    }
  }, [categories, watchedCategoryId, setValue]);

  // Watch fields for live counters and preview card
  const watchedName = watch("name") || "";
  const watchedTagline = watch("tagline") || "";
  const watchedShortDesc = watch("description_short") || "";
  const watchedLongDesc = watch("description_long") || "";
  const watchedPricing = watch("pricing_model") || "freemium";

  // File upload states (Logo required + Screenshots max 5)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoError, setLogoError] = useState<string | null>(null);

  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [screenshotsError, setScreenshotsError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);
  const formStartedAtRef = useRef<number>(Date.now());

  const [serverBannerError, setServerBannerError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] =
    useState<SubmittedListingResponse | null>(null);
  const [emittedEventName, setEmittedEventName] =
    useState<string>("listing_submitted");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Logo must be a valid image file (PNG, JPG, WebP, SVG, GIF).");
      return;
    }

    if (file.size > SUBMIT_LIMITS.MAX_FILE_SIZE_BYTES) {
      setLogoError("Logo image size cannot exceed 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoError(null);
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const combined = [...screenshotFiles, ...selected];
    if (combined.length > SUBMIT_LIMITS.MAX_SCREENSHOTS) {
      setScreenshotsError(
        `You can upload a maximum of ${SUBMIT_LIMITS.MAX_SCREENSHOTS} screenshots.`
      );
      return;
    }

    for (const file of selected) {
      if (!file.type.startsWith("image/")) {
        setScreenshotsError("All screenshots must be valid image files.");
        return;
      }
      if (file.size > SUBMIT_LIMITS.MAX_FILE_SIZE_BYTES) {
        setScreenshotsError(`"${file.name}" exceeds the 5MB file size limit.`);
        return;
      }
    }

    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setScreenshotFiles(combined);
    setScreenshotPreviews((prev) => [...prev, ...newPreviews]);
    setScreenshotsError(null);
    if (screenshotsInputRef.current) {
      screenshotsInputRef.current.value = "";
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
    setScreenshotsError(null);
  };

  const onSubmit = async (values: SubmitListingFormValues) => {
    setServerBannerError(null);

    // Client-side file validation
    let hasFileError = false;
    if (!logoFile) {
      setLogoError("Tool logo image is required.");
      hasFileError = true;
    }
    if (screenshotFiles.length > SUBMIT_LIMITS.MAX_SCREENSHOTS) {
      setScreenshotsError(
        `You can upload a maximum of ${SUBMIT_LIMITS.MAX_SCREENSHOTS} screenshots.`
      );
      hasFileError = true;
    }
    if (hasFileError) return;

    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("tagline", values.tagline.trim());
      formData.append("description_short", values.description_short.trim());
      formData.append("description_long", values.description_long.trim());
      formData.append("website_url", values.website_url.trim());
      formData.append("category_id", values.category_id.trim());
      formData.append("pricing_model", values.pricing_model);
      formData.append("submitted_by_email", values.submitted_by_email.trim());
      formData.append("form_started_at", String(formStartedAtRef.current));
      if (values.company_website_hp) {
        formData.append("company_website_hp", values.company_website_hp);
      }

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      for (const file of screenshotFiles) {
        formData.append("screenshots", file);
      }

      // Strictly call our own backend API: POST /api/listings
      const res = await fetch("/api/listings", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.errors && typeof data.errors === "object") {
          const schemaFields: (keyof SubmitListingFormValues)[] = [
            "name",
            "tagline",
            "description_short",
            "description_long",
            "website_url",
            "category_id",
            "pricing_model",
            "submitted_by_email",
          ];

          for (const field of schemaFields) {
            if (data.errors[field]) {
              setError(field, {
                type: "server",
                message: String(data.errors[field]),
              });
            }
          }

          if (data.errors.logo) {
            setLogoError(String(data.errors.logo));
          }
          if (data.errors.screenshots) {
            setScreenshotsError(String(data.errors.screenshots));
          }
        }

        setServerBannerError(
          data.message || "Submission failed. Please review the highlighted fields."
        );
        return;
      }

      setSubmittedResult(data.listing);
      if (data.event?.event_name) {
        setEmittedEventName(data.event.event_name);
      }
    } catch (err: unknown) {
      setServerBannerError(
        err instanceof Error
          ? err.message
          : "Network error while submitting your tool."
      );
    }
  };

  const handleReset = () => {
    reset({
      name: "",
      tagline: "",
      description_short: "",
      description_long: "",
      website_url: "",
      category_id: categories[0]?.id || "",
      pricing_model: "freemium",
      submitted_by_email: "",
    });
    setLogoFile(null);
    setLogoPreview("");
    setLogoError(null);
    setScreenshotFiles([]);
    setScreenshotPreviews([]);
    setScreenshotsError(null);
    setSubmittedResult(null);
    setServerBannerError(null);
    formStartedAtRef.current = Date.now();
  };

  const selectedCategoryName =
    categories.find((c) => c.id === watchedCategoryId)?.name || "Category";

  const selectedPricingLabel =
    PRICING_OPTIONS.find((p) => p.value === watchedPricing)?.label ||
    watchedPricing;

  const previewSlug =
    submittedResult?.slug ||
    watchedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "your-tool";

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0F0F10] selection:bg-[#5B5BF0]/15 selection:text-[#5B5BF0]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E8E3] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                href="/"
                className="text-xs font-mono text-[#66666B] hover:text-[#5B5BF0] transition-colors flex items-center gap-1 font-semibold"
              >
                <span>&larr; Back to Directory</span>
              </Link>
              <span className="text-xs text-[#E8E8E3]">•</span>
              <span className="text-xs font-mono font-bold text-[#5B5BF0]">
                Public Submission
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#0F0F10] tracking-[-0.03em]">
              Submit Your Tool
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#66666B]">
              Submit your software or AI tool without logging in. All submissions enter moderation with{" "}
              <span className="font-mono font-bold text-[#0F0F10]">pending</span> status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[#E8E8E3] bg-white px-3.5 py-1.5 text-xs font-mono text-[#66666B] shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#10B981]" />
              <span>Moderated Directory</span>
            </div>
          </div>
        </div>

        {/* Server Error Banner */}
        {serverBannerError && (
          <div
            role="alert"
            className="rounded-[12px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#DC2626]"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Submission Failed</span>
              <span>{serverBannerError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerBannerError(null)}
              className="text-[#DC2626] hover:opacity-75"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {!submittedResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: REACT-HOOK-FORM + ZOD FORM (7 COLS) */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="lg:col-span-7 space-y-6"
            >
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    1. Tool Details
                  </h2>
                  <p className="text-xs sm:text-sm text-[#66666B]">
                    All fields below are validated client-side and verified on the server.
                  </p>
                </div>

                {/* Honeypot anti-spam trap (hidden from real humans) */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label htmlFor="field-company-website-hp">
                    Leave this field empty
                  </label>
                  <input
                    id="field-company-website-hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register("company_website_hp")}
                  />
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="field-name"
                    className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                  >
                    Tool Name <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    placeholder="e.g. WritePro"
                    {...register("name")}
                    className={`w-full h-10 rounded-[10px] border bg-white px-3.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                      errors.name
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Tagline (60 chars limit) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-tagline"
                      className="text-xs font-bold text-[#0F0F10]"
                    >
                      Tagline <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        watchedTagline.length > SUBMIT_LIMITS.TAGLINE_MAX
                          ? "text-[#DC2626]"
                          : watchedTagline.length > 50
                          ? "text-[#EA580C]"
                          : "text-[#8E8E93]"
                      }`}
                    >
                      {watchedTagline.length}/{SUBMIT_LIMITS.TAGLINE_MAX}
                    </span>
                  </div>
                  <input
                    id="field-tagline"
                    type="text"
                    placeholder="Short headline (max 60 characters)"
                    {...register("tagline")}
                    className={`w-full h-10 rounded-[10px] border bg-white px-3.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                      errors.tagline
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                    }`}
                  />
                  {errors.tagline && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.tagline.message}
                    </p>
                  )}
                </div>

                {/* Website URL (HTTPS only) */}
                <div>
                  <label
                    htmlFor="field-website-url"
                    className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                  >
                    Website URL (HTTPS Only) <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93] pointer-events-none" />
                    <input
                      id="field-website-url"
                      type="url"
                      placeholder="https://writepro.ai"
                      {...register("website_url")}
                      className={`w-full h-10 rounded-[10px] border bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                        errors.website_url
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                      }`}
                    />
                  </div>
                  {errors.website_url && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.website_url.message}
                    </p>
                  )}
                </div>

                {/* Short Description (250 chars limit) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-description-short"
                      className="text-xs font-bold text-[#0F0F10]"
                    >
                      Short Description <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        watchedShortDesc.length > SUBMIT_LIMITS.SHORT_DESC_MAX
                          ? "text-[#DC2626]"
                          : watchedShortDesc.length > 220
                          ? "text-[#EA580C]"
                          : "text-[#8E8E93]"
                      }`}
                    >
                      {watchedShortDesc.length}/{SUBMIT_LIMITS.SHORT_DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    id="field-description-short"
                    rows={2}
                    placeholder="Brief introduction (max 250 characters)..."
                    {...register("description_short")}
                    className={`w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                      errors.description_short
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                    }`}
                  />
                  {errors.description_short && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.description_short.message}
                    </p>
                  )}
                </div>

                {/* Long Description (2000 chars limit) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-description-long"
                      className="text-xs font-bold text-[#0F0F10]"
                    >
                      Long Description <span className="text-[#DC2626]">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        watchedLongDesc.length > SUBMIT_LIMITS.LONG_DESC_MAX
                          ? "text-[#DC2626]"
                          : watchedLongDesc.length > 1800
                          ? "text-[#EA580C]"
                          : "text-[#8E8E93]"
                      }`}
                    >
                      {watchedLongDesc.length}/{SUBMIT_LIMITS.LONG_DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    id="field-description-long"
                    rows={5}
                    placeholder="Complete tool details, features, and use cases (max 2,000 characters)..."
                    {...register("description_long")}
                    className={`w-full rounded-[10px] border bg-white px-3.5 py-2.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                      errors.description_long
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                    }`}
                  />
                  {errors.description_long && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.description_long.message}
                    </p>
                  )}
                </div>

                {/* Category (<select> populated from GET /api/categories) & Pricing Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-category"
                      className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                    >
                      Category <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-category"
                        disabled={loadingCategories}
                        {...register("category_id")}
                        className={`w-full h-10 appearance-none rounded-[10px] border bg-white px-3.5 text-sm font-medium text-[#0F0F10] focus:outline-none ${
                          errors.category_id
                            ? "border-[#DC2626]"
                            : "border-[#E8E8E3] focus:border-[#5B5BF0]"
                        }`}
                      >
                        {loadingCategories ? (
                          <option value="">Loading categories...</option>
                        ) : categories.length === 0 ? (
                          <option value="">No categories available</option>
                        ) : (
                          categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))
                        )}
                      </select>
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93] pointer-events-none" />
                    </div>
                    {categoriesError && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {categoriesError}
                      </p>
                    )}
                    {errors.category_id && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-pricing"
                      className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                    >
                      Pricing Model <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-pricing"
                        {...register("pricing_model")}
                        className={`w-full h-10 appearance-none rounded-[10px] border bg-white px-3.5 text-sm font-medium text-[#0F0F10] focus:outline-none ${
                          errors.pricing_model
                            ? "border-[#DC2626]"
                            : "border-[#E8E8E3] focus:border-[#5B5BF0]"
                        }`}
                      >
                        {PRICING_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93] pointer-events-none" />
                    </div>
                    {errors.pricing_model && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {errors.pricing_model.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submitter Email */}
                <div className="border-t border-[#E8E8E3] pt-4">
                  <label
                    htmlFor="field-email"
                    className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                  >
                    Submitter Email <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93] pointer-events-none" />
                    <input
                      id="field-email"
                      type="email"
                      placeholder="maker@writepro.ai"
                      {...register("submitted_by_email")}
                      className={`w-full h-10 rounded-[10px] border bg-white pl-10 pr-3.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                        errors.submitted_by_email
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                      }`}
                    />
                  </div>
                  {errors.submitted_by_email && (
                    <p className="mt-1 text-xs font-medium text-[#DC2626]">
                      {errors.submitted_by_email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* MEDIA SECTION: LOGO + SCREENSHOTS (MAX 5) */}
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    2. Logo & Screenshots
                  </h2>
                  <p className="text-xs sm:text-sm text-[#66666B]">
                    Upload your required tool logo and up to 5 product screenshots.
                  </p>
                </div>

                {/* Logo Input */}
                <div>
                  <label className="block text-xs font-bold text-[#0F0F10] mb-2">
                    Tool Logo <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-[12px] border border-[#E8E8E3] bg-[#FAFAF7] overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-[#8E8E93]" />
                      )}
                    </div>

                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className={`w-full rounded-[12px] border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                        logoError
                          ? "border-[#DC2626] bg-[#FEF2F2]"
                          : "border-[#D5D5CE] hover:border-[#5B5BF0] bg-[#FAFAF7]"
                      }`}
                    >
                      <UploadCloud className="h-5 w-5 text-[#5B5BF0] mx-auto mb-1" />
                      <span className="text-xs font-semibold text-[#0F0F10] block">
                        {logoFile ? logoFile.name : "Click to upload tool logo"}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">
                        PNG, JPG, SVG, WebP or GIF (Max 5MB)
                      </span>
                    </div>
                  </div>
                  {logoError && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                      {logoError}
                    </p>
                  )}
                </div>

                {/* Screenshots Input (Max 5) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#0F0F10]">
                      Screenshots (Maximum {SUBMIT_LIMITS.MAX_SCREENSHOTS})
                    </label>
                    <span className="text-xs font-mono font-semibold text-[#66666B]">
                      {screenshotFiles.length}/{SUBMIT_LIMITS.MAX_SCREENSHOTS} selected
                    </span>
                  </div>

                  <input
                    ref={screenshotsInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleScreenshotsChange}
                    className="hidden"
                  />

                  {screenshotFiles.length < SUBMIT_LIMITS.MAX_SCREENSHOTS && (
                    <div
                      onClick={() => screenshotsInputRef.current?.click()}
                      className={`rounded-[12px] border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${
                        screenshotsError
                          ? "border-[#DC2626] bg-[#FEF2F2]"
                          : "border-[#D5D5CE] hover:border-[#5B5BF0] bg-[#FAFAF7]"
                      }`}
                    >
                      <UploadCloud className="h-6 w-6 text-[#5B5BF0] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#0F0F10] block">
                        Click to add screenshots (
                        {SUBMIT_LIMITS.MAX_SCREENSHOTS - screenshotFiles.length} remaining)
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">
                        Up to 5 images showing your tool interface
                      </span>
                    </div>
                  )}

                  {screenshotsError && (
                    <p className="mt-1.5 text-xs font-medium text-[#DC2626]">
                      {screenshotsError}
                    </p>
                  )}

                  {screenshotPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {screenshotPreviews.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-[10px] border border-[#E8E8E3] overflow-hidden bg-[#FAFAF7] aspect-video"
                        >
                          <img
                            src={src}
                            alt={`Screenshot ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#0F0F10]/80 text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                            title="Remove screenshot"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <span className="absolute bottom-1.5 left-1.5 rounded bg-[#0F0F10]/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[10px] bg-[#EEF0FE]/60 border border-[#D5D8FC] p-3.5 text-xs text-[#47474F] flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-[#5B5BF0] shrink-0" />
                  <span>
                    Submitting saves your tool with <strong>pending</strong> status. It will appear publicly only after admin approval.
                  </span>
                </div>

                {/* Submit Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <Link href="/">
                    <Button type="button" variant="ghost" size="md">
                      Cancel
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    rightIcon={
                      isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )
                    }
                    className="font-bold shadow-[0_2px_10px_rgba(91,91,240,0.25)]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Tool"}
                  </Button>
                </div>
              </div>
            </form>

            {/* RIGHT: LIVE PREVIEW CARD (5 COLS) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E8E93]">
                  Live Directory Card Preview
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#10B981]">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  Real-time
                </span>
              </div>

              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-[12px] bg-linear-to-br from-[#EEF0FE] to-[#D5D8FC] border border-[#D5D8FC] overflow-hidden shrink-0 flex items-center justify-center font-heading font-extrabold text-base text-[#5B5BF0] shadow-xs">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt={watchedName || "Logo"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (watchedName || "TL").slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#0F0F10] tracking-tight">
                          {watchedName || "Your Tool Name"}
                        </h3>
                        <span className="rounded-full bg-[#FEF3C7] text-[#D97706] px-2 py-0.5 text-[10px] font-mono font-bold">
                          pending
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8E8E93]">
                        <span className="font-mono text-[11px] text-[#5B5BF0]">
                          /{previewSlug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-[10px] border border-[#E8E8E3] bg-[#FAFAF7] px-3 py-1.5 shadow-xs">
                    <ArrowBigUp className="h-4 w-4 text-[#5B5BF0] fill-current" />
                    <span className="font-mono text-xs font-bold text-[#0F0F10]">1</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-[#0F0F10] line-clamp-2 leading-relaxed">
                  {watchedTagline || "Your 60-character tagline will appear here..."}
                </p>

                {watchedShortDesc && (
                  <p className="text-xs text-[#66666B] line-clamp-3 leading-relaxed">
                    {watchedShortDesc}
                  </p>
                )}

                {screenshotPreviews.length > 0 && (
                  <div className="h-28 w-full rounded-[8px] overflow-hidden border border-[#E8E8E3] bg-[#FAFAF7]">
                    <img
                      src={screenshotPreviews[0]}
                      alt="Screenshot preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-[#E8E8E3]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-semibold text-[#66666B]">
                      {selectedCategoryName}
                    </span>
                    <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-semibold text-[#66666B]">
                      {selectedPricingLabel}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-[#66666B] flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {screenshotFiles.length}/{SUBMIT_LIMITS.MAX_SCREENSHOTS} Screenshots
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CONFIRMATION VIEW */
          <div className="max-w-2xl mx-auto rounded-[20px] border border-[#E8E8E3] bg-white p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-center space-y-7 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981] border-4 border-[#A7F3D0]">
              <Sparkles className="h-9 w-9 text-[#059669]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#059669]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Submission Received • Pending Admin Review
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#0F0F10] tracking-tight">
                {submittedResult.name} is queued for review!
              </h2>
              <p className="text-sm text-[#66666B] max-w-md mx-auto">
                Your tool has been saved in the database with{" "}
                <strong className="text-[#0F0F10]">pending</strong> status. It will become publicly visible once approved by an administrator.
              </p>
            </div>

            <div className="rounded-[14px] bg-[#FAFAF7] border border-[#E8E8E3] p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Listing UUID:</span>
                <span className="font-mono font-bold text-[#0F0F10]">
                  {submittedResult.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Unique Slug:</span>
                <span className="font-mono font-bold text-[#5B5BF0]">
                  {submittedResult.slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Status:</span>
                <span className="font-mono font-bold uppercase text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                  {submittedResult.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Pricing Model:</span>
                <span className="font-mono font-bold text-[#0F0F10]">
                  {submittedResult.pricing_model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Event Emitted:</span>
                <span className="font-mono font-bold text-[#059669]">
                  {emittedEventName}
                </span>
              </div>
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
                onClick={handleReset}
                className="w-full sm:w-auto font-bold shadow-[0_2px_10px_rgba(91,91,240,0.25)]"
                leftIcon={<RefreshCw className="h-4 w-4" />}
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

