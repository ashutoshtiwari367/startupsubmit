"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  UploadCloud,
  Check,
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
import { AuthModal } from "./AuthModal";
import {
  submitListingSchema,
  SubmitListingFormValues,
  SUBMIT_LIMITS,
} from "@/lib/schemas/submitListing";
import { getAllPlans, getPlanById, SITE_CONFIG } from "@/config/site";
import type { CategoryRow, PricingModel, ListingStatus } from "@/types/db";

interface SubmittedListingResponse {
  id: number | string;
  name: string;
  slug: string;
  status: ListingStatus;
  category_id: number | string;
  pricing_model: PricingModel;
  starting_price?: number | null;
  currency?: string;
  billing_period?: string | null;
  listing_plan?: string;
  listing_plan_price?: number;
  website_url: string;
  logo_url: string;
  screenshots: string[];
  created_at: string;
}

export const SOFTWARE_PRICING_OPTIONS = [
  {
    value: "free",
    label: "Free",
    badge: "100% Free",
    description: "Completely free, open source, or free tier only. No paid plans.",
  },
  {
    value: "freemium",
    label: "Freemium",
    badge: "Free + Paid Upgrades",
    description: "Free version with starting paid upgrades or subscription plans.",
  },
  {
    value: "premium",
    label: "Premium",
    badge: "Paid Software",
    description: "Commercial software requiring paid purchase or subscription.",
  },
] as const;

export const BILLING_PERIOD_OPTIONS = [
  { value: "monthly", label: "Monthly (/month)" },
  { value: "yearly", label: "Yearly (/year)" },
  { value: "one_time", label: "One-time" },
] as const;

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
    resolver: zodResolver(submitListingSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      category_id: "",
      custom_category: "",
      pricing_model: "free",
      starting_price: null,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "free",
      listing_plan_price: 0,
      website_url: "",
      tagline: "",
      description_short: "",
      description_long: "",
      submitted_by_email: "",
      company_website_hp: "",
    },
  });

  // Auto-select first category once loaded from /api/categories
  const watchedCategoryId = watch("category_id") || "";
  const watchedCustomCategory = watch("custom_category") || "";
  const selectedCategoryObj = categories.find(
    (c) => String(c.id) === watchedCategoryId
  );
  const isOtherCategory =
    watchedCategoryId.trim().toLowerCase() === "other" ||
    selectedCategoryObj?.slug?.toLowerCase() === "other" ||
    selectedCategoryObj?.name?.trim().toLowerCase() === "other";

  useEffect(() => {
    if (!watchedCategoryId && categories.length > 0) {
      setValue("category_id", String(categories[0].id), {
        shouldValidate: true,
      });
    }
  }, [categories, watchedCategoryId, setValue]);

  // Watch fields for live counters and preview card
  const watchedName = watch("name") || "";
  const watchedTagline = watch("tagline") || "";
  const watchedShortDesc = watch("description_short") || "";
  const watchedLongDesc = watch("description_long") || "";
  const watchedPricingModel = watch("pricing_model") || "free";
  const watchedStartingPrice = watch("starting_price");
  const watchedBillingPeriod = watch("billing_period") || "monthly";
  const watchedListingPlan = watch("listing_plan") || "free";

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
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] =
    useState<SubmittedListingResponse | null>(null);
  const [emittedEventName, setEmittedEventName] =
    useState<string>("listing_submitted");

  // Pre-select listing plan from URL ?plan= query parameter if provided
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get("plan");
      if (
        planParam &&
        ["free", "premium", "featured", "freemium", "paid", "one_time"].includes(planParam)
      ) {
        setValue("listing_plan", planParam as any, { shouldValidate: true });
      }
    }
  }, [setValue]);

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

  const submitListingToApi = async (
    values: SubmitListingFormValues,
    verifiedPaymentRecordId: number | string | null = null
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name.trim());
      formData.append("tagline", values.tagline.trim());
      formData.append("description_short", values.description_short.trim());
      formData.append("description_long", values.description_long.trim());
      formData.append("website_url", (values.website_url || "").trim());
      formData.append("category_id", values.category_id.trim());
      if (values.custom_category) {
        formData.append("custom_category", values.custom_category.trim());
      }
      formData.append("pricing_model", values.pricing_model);
      if (
        values.starting_price !== undefined &&
        values.starting_price !== null &&
        !isNaN(Number(values.starting_price))
      ) {
        formData.append("starting_price", String(values.starting_price));
      }
      formData.append("currency", values.currency || "USD");
      if (values.billing_period) {
        formData.append("billing_period", values.billing_period);
      }
      formData.append("listing_plan", values.listing_plan || "free");
      if (
        values.listing_plan_price !== undefined &&
        values.listing_plan_price !== null
      ) {
        formData.append("listing_plan_price", String(values.listing_plan_price));
      }
      formData.append("submitted_by_email", values.submitted_by_email.trim());
      formData.append("form_started_at", String(formStartedAtRef.current));
      if (values.company_website_hp) {
        formData.append("company_website_hp", values.company_website_hp);
      }
      if (verifiedPaymentRecordId) {
        formData.append("payment_record_id", String(verifiedPaymentRecordId));
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
            "category_id",
            "custom_category",
            "pricing_model",
            "starting_price",
            "currency",
            "billing_period",
            "listing_plan",
            "listing_plan_price",
            "website_url",
            "tagline",
            "description_short",
            "description_long",
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

    // CRITICAL: Software pricing (values.pricing_model: free, freemium, premium) is descriptive only and NEVER triggers payment.
    // Only the directory listing plan (values.listing_plan: free, premium, featured) triggers payment if price > 0.
    const selectedListingPlan = getPlanById(values.listing_plan || "free");
    const selectedPlan = selectedListingPlan;

    if (selectedPlan && selectedPlan.price > 0) {
      setIsPaymentProcessing(true);
      try {
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: selectedListingPlan.id }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          setIsPaymentProcessing(false);
          if (orderRes.status === 401) {
            setShowAuthModal(true);
            setServerBannerError(
              `Please sign in first to complete your ${selectedListingPlan.formattedPrice} ${selectedListingPlan.name} payment.`
            );
            return;
          }
          setServerBannerError(
            orderData.error || "Could not initiate payment for this listing plan."
          );
          return;
        }

        if (!window.Razorpay) {
          setIsPaymentProcessing(false);
          setServerBannerError(
            "Razorpay Checkout SDK is loading. Please try again in a moment."
          );
          return;
        }

        const rzpOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: SITE_CONFIG.name,
          description: `${selectedListingPlan.name} — ${values.name.trim()}`,
          order_id: orderData.orderId,
          prefill: {
            email: values.submitted_by_email.trim() || orderData.userEmail || "",
          },
          theme: { color: "#5B5BF0" },
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                setServerBannerError(
                  verifyData.error || "Payment verification failed."
                );
                setIsPaymentProcessing(false);
                return;
              }

              // Payment verified -> Now submit listing to POST /api/listings!
              await submitListingToApi(values, verifyData.paymentRecordId ?? null);
            } catch {
              setServerBannerError("Error verifying payment with server.");
            } finally {
              setIsPaymentProcessing(false);
            }
          },
          modal: {
            ondismiss: () => {
              setIsPaymentProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
          setServerBannerError(
            resp.error?.description || "Payment failed. Please try again."
          );
          setIsPaymentProcessing(false);
        });
        rzp.open();
      } catch (err: unknown) {
        setIsPaymentProcessing(false);
        setServerBannerError(
          err instanceof Error
            ? err.message
            : "Network error while starting payment."
        );
      }
      return;
    }

    // Free listing plan ('free') -> Submit directly without payment
    await submitListingToApi(values, null);
  };

  const handleReset = () => {
    reset({
      name: "",
      category_id: categories[0]?.id ? String(categories[0].id) : "",
      custom_category: "",
      pricing_model: "free",
      starting_price: null,
      currency: "USD",
      billing_period: "monthly",
      listing_plan: "free",
      listing_plan_price: 0,
      website_url: "",
      tagline: "",
      description_short: "",
      description_long: "",
      submitted_by_email: "",
      company_website_hp: "",
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

  const selectedCategoryName = isOtherCategory
    ? watchedCustomCategory.trim() || "Other"
    : categories.find((c) => String(c.id) === String(watchedCategoryId))
        ?.name || "Category";

  const selectedSoftwarePricing = SOFTWARE_PRICING_OPTIONS.find(
    (p) => p.value === watchedPricingModel
  );
  const selectedPricingLabel =
    selectedSoftwarePricing?.label || watchedPricingModel;

  const selectedListingPlan = getPlanById(watchedListingPlan || "free");
  const directoryPlans = getAllPlans();

  const formatSoftwarePricingPreview = () => {
    if (watchedPricingModel === "free") return "Free";
    const periodLabel =
      watchedBillingPeriod === "one_time"
        ? "once"
        : watchedBillingPeriod === "yearly"
        ? "yr"
        : "mo";
    if (
      watchedStartingPrice !== undefined &&
      watchedStartingPrice !== null &&
      Number(watchedStartingPrice) > 0
    ) {
      if (watchedPricingModel === "freemium") {
        return `Freemium • From $${watchedStartingPrice}/${periodLabel}`;
      }
      return `Premium • $${watchedStartingPrice}/${periodLabel}`;
    }
    return watchedPricingModel === "freemium" ? "Freemium" : "Premium";
  };

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
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
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

                {/* 1. Name */}
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

                {/* 2. Category (Moved BEFORE Website URL, includes 'Other' option) */}
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
                      ) : (
                        <>
                          {categories.map((cat) => (
                            <option key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </option>
                          ))}
                          <option value="other">
                            Other (Specify custom category)
                          </option>
                        </>
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

                {/* Conditional Custom Category Field when "Other" is selected */}
                {isOtherCategory && (
                  <div className="rounded-[12px] border border-[#5B5BF0]/30 bg-[#EEF0FE]/40 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="field-custom-category"
                        className="block text-xs font-bold text-[#0F0F10]"
                      >
                        Specify Other Category <span className="text-[#DC2626]">*</span>
                      </label>
                      <span className="text-xs font-mono font-semibold text-[#66666B]">
                        {watchedCustomCategory.length}/{SUBMIT_LIMITS.CUSTOM_CATEGORY_MAX}
                      </span>
                    </div>
                    <input
                      id="field-custom-category"
                      type="text"
                      autoFocus
                      placeholder="e.g. Cybersecurity, LegalTech, Web3, HR Tech"
                      {...register("custom_category")}
                      className={`w-full h-10 rounded-[10px] border bg-white px-3.5 text-sm text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                        errors.custom_category
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                      }`}
                    />
                    {errors.custom_category && (
                      <p className="mt-1 text-xs font-medium text-[#DC2626]">
                        {errors.custom_category.message}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Website URL (Required for standard categories; optional when 'Other' is selected) */}
                <div>
                  <label
                    htmlFor="field-website-url"
                    className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                  >
                    Website URL (HTTPS Only){" "}
                    {isOtherCategory ? (
                      <span className="text-xs font-normal text-[#66666B]">(Optional)</span>
                    ) : (
                      <span className="text-[#DC2626]">*</span>
                    )}
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

                {/* 4. Tagline (60 chars limit) */}
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

                {/* 5. Short Description (250 chars limit) */}
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

                {/* 6. Long Description (2000 chars limit) */}
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

              {/* SECTION 2: SOFTWARE PRICING MODEL */}
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                      2. Software Pricing
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                      Descriptive Only • No Fee
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#66666B] mt-1">
                    Describe how your software or AI tool is priced. This does <strong>not</strong> charge you and does not trigger checkout.
                  </p>
                </div>

                {/* Software Pricing Model Cards (Free, Freemium, Premium) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SOFTWARE_PRICING_OPTIONS.map((opt) => {
                    const isSelected = watchedPricingModel === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setValue("pricing_model", opt.value, {
                            shouldValidate: true,
                          });
                          if (opt.value === "free") {
                            setValue("starting_price", null, {
                              shouldValidate: true,
                            });
                          }
                        }}
                        className={`cursor-pointer rounded-[14px] p-4 border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? "border-[#5B5BF0] bg-[#EEF0FE]/40 ring-2 ring-[#5B5BF0]/20 shadow-xs"
                            : "border-[#E8E8E3] bg-white hover:border-[#D5D5CE] hover:bg-[#FAFAF7]"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-extrabold text-sm text-[#0F0F10]">
                              {opt.label}
                            </span>
                            <span
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-[#5B5BF0] bg-[#5B5BF0] text-white"
                                  : "border-[#D5D5CE] bg-white"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                          </div>
                          <span className="inline-block text-[10px] font-mono font-bold text-[#5B5BF0] uppercase tracking-wider">
                            {opt.badge}
                          </span>
                          <p className="text-xs text-[#66666B] leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.pricing_model && (
                  <p className="text-xs font-medium text-[#DC2626]">
                    {errors.pricing_model.message}
                  </p>
                )}

                {/* Conditional Pricing Fields for Freemium and Premium */}
                {(watchedPricingModel === "freemium" ||
                  watchedPricingModel === "premium") && (
                  <div className="rounded-[12px] border border-[#5B5BF0]/25 bg-[#EEF0FE]/30 p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F0F10]">
                      <DollarSign className="h-4 w-4 text-[#5B5BF0]" />
                      <span>
                        {watchedPricingModel === "freemium"
                          ? "Freemium Pricing Details"
                          : "Premium Software Pricing Details"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Price in USD ($) */}
                      <div>
                        <label
                          htmlFor="field-starting-price"
                          className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                        >
                          {watchedPricingModel === "freemium"
                            ? "Starting Paid-Plan Price (USD $)"
                            : "Software Price (USD $)"}{" "}
                          <span className="text-[#DC2626]">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#66666B]">
                            $
                          </span>
                          <input
                            id="field-starting-price"
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="e.g. 29"
                            {...register("starting_price")}
                            className={`w-full h-10 rounded-[10px] border bg-white pl-8 pr-3.5 text-sm font-medium text-[#0F0F10] placeholder:text-[#8E8E93] focus:outline-none transition-all ${
                              errors.starting_price
                                ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                                : "border-[#E8E8E3] focus:border-[#5B5BF0] focus:ring-2 focus:ring-[#5B5BF0]/20"
                            }`}
                          />
                        </div>
                        {errors.starting_price && (
                          <p className="mt-1 text-xs font-medium text-[#DC2626]">
                            {errors.starting_price.message}
                          </p>
                        )}
                      </div>

                      {/* Billing Period */}
                      <div>
                        <label
                          htmlFor="field-billing-period"
                          className="block text-xs font-bold text-[#0F0F10] mb-1.5"
                        >
                          Billing Period <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                          id="field-billing-period"
                          {...register("billing_period")}
                          className={`w-full h-10 appearance-none rounded-[10px] border bg-white px-3.5 text-sm font-medium text-[#0F0F10] focus:outline-none ${
                            errors.billing_period
                              ? "border-[#DC2626]"
                              : "border-[#E8E8E3] focus:border-[#5B5BF0]"
                          }`}
                        >
                          {BILLING_PERIOD_OPTIONS.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                        {errors.billing_period && (
                          <p className="mt-1 text-xs font-medium text-[#DC2626]">
                            {errors.billing_period.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Example helper display */}
                    <div className="rounded-[8px] bg-white border border-[#D5D8FC] px-3.5 py-2 text-xs text-[#5B5BF0] font-mono flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Example:{" "}
                        <strong className="text-[#0F0F10]">
                          {watchedPricingModel === "freemium"
                            ? `Freemium software – Starting at $${watchedStartingPrice || 29}/${
                                watchedBillingPeriod === "one_time"
                                  ? "once"
                                  : watchedBillingPeriod === "yearly"
                                  ? "year"
                                  : "month"
                              }`
                            : `Premium software – $${watchedStartingPrice || 49}/${
                                watchedBillingPeriod === "one_time"
                                  ? "once"
                                  : watchedBillingPeriod === "yearly"
                                  ? "year"
                                  : "month"
                              }`}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: CHOOSE YOUR LISTING PLAN (DIRECTORY MONETIZATION) */}
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                      3. Choose Your Listing Plan
                    </h2>
                    <span className="text-[11px] font-mono font-bold text-[#5B5BF0] bg-[#EEF0FE] border border-[#D5D8FC] px-2.5 py-0.5 rounded-full">
                      Directory Monetization
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#66666B] mt-1">
                    Choose how you want your product launched on LaunchOS. Free Listing is 100% free with no payment required. Paid plans fast-track your launch.
                  </p>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {directoryPlans.map((plan) => {
                    const isSelected = watchedListingPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => {
                          setValue("listing_plan", plan.id as any, {
                            shouldValidate: true,
                          });
                          setValue("listing_plan_price", plan.price, {
                            shouldValidate: true,
                          });
                        }}
                        className={`cursor-pointer rounded-[14px] p-4 sm:p-5 border transition-all text-left flex flex-col justify-between relative ${
                          isSelected
                            ? "border-[#5B5BF0] bg-[#EEF0FE]/40 ring-2 ring-[#5B5BF0]/20 shadow-xs"
                            : "border-[#E8E8E3] bg-white hover:border-[#D5D5CE] hover:bg-[#FAFAF7]"
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2.5 right-3 bg-[#5B5BF0] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                            POPULAR
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-heading font-extrabold text-sm text-[#0F0F10]">
                              {plan.name}
                            </span>
                            <span
                              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-[#5B5BF0] bg-[#5B5BF0] text-white"
                                  : "border-[#D5D5CE] bg-white"
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="font-heading font-black text-2xl text-[#0F0F10]">
                              {plan.formattedPrice}
                            </span>
                            <span className="text-[11px] font-mono text-[#8E8E93]">
                              / {plan.period}
                            </span>
                          </div>

                          <span className="inline-block rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#66666B]">
                            {plan.reviewSla}
                          </span>

                          <p className="text-xs text-[#66666B] leading-relaxed line-clamp-2">
                            {plan.description}
                          </p>

                          <ul className="pt-2 border-t border-[#E8E8E3]/60 space-y-1.5 text-[11px] text-[#47474F]">
                            {plan.features.slice(0, 3).map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-1.5">
                                <Check className="h-3 w-3 text-[#10B981] shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[10px] bg-[#FAFAF7] border border-[#E8E8E3] p-3 text-xs text-[#66666B] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0" />
                  <span>
                    <strong>Business Logic Guarantee:</strong> Software pricing above describes your product to buyers and never triggers a charge. Only choosing <strong>Premium ($29)</strong> or <strong>Featured ($49)</strong> initiates checkout.
                  </span>
                </div>
              </div>

              {/* MEDIA SECTION: LOGO + SCREENSHOTS (MAX 5) */}
              <div className="rounded-[16px] border border-[#E8E8E3] bg-white p-6 sm:p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
                <div className="border-b border-[#E8E8E3] pb-4">
                  <h2 className="font-heading font-extrabold text-xl text-[#0F0F10] tracking-tight">
                    4. Logo & Screenshots
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
                    disabled={isSubmitting || isPaymentProcessing}
                    rightIcon={
                      isSubmitting || isPaymentProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )
                    }
                    className="font-bold shadow-[0_2px_10px_rgba(91,91,240,0.25)]"
                  >
                    {isPaymentProcessing
                      ? "Processing Payment..."
                      : isSubmitting
                        ? "Submitting..."
                        : selectedListingPlan && selectedListingPlan.price > 0
                          ? `Pay ${selectedListingPlan.formattedPrice} & Submit Tool`
                          : "Submit Tool for Free"}
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
                    <span className="rounded-full bg-[#FAFAF7] border border-[#E8E8E3] px-2 py-0.5 text-[10px] font-semibold text-[#0F0F10]">
                      {formatSoftwarePricingPreview()}
                    </span>
                    <span className="rounded-full bg-[#EEF0FE] border border-[#D5D8FC] px-2 py-0.5 text-[10px] font-semibold text-[#5B5BF0]">
                      {selectedListingPlan?.name || "Free Listing"}
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
                <span className="text-[#8E8E93]">Listing ID:</span>
                <span className="font-mono font-bold text-[#0F0F10] bg-[#EEF0FE] px-2 py-0.5 rounded border border-[#D5D8FC]">
                  {submittedResult.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Public URL Slug:</span>
                <span className="font-mono font-bold text-[#5B5BF0]">
                  /product/{submittedResult.slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Status:</span>
                <span className="font-mono font-bold uppercase text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
                  {submittedResult.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Software Pricing:</span>
                <span className="font-mono font-bold text-[#0F0F10]">
                  {submittedResult.pricing_model}
                  {submittedResult.starting_price
                    ? ` ($${submittedResult.starting_price}/${
                        submittedResult.billing_period === "one_time"
                          ? "once"
                          : submittedResult.billing_period === "yearly"
                          ? "yr"
                          : "mo"
                      })`
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E8E93]">Directory Listing Plan:</span>
                <span className="font-mono font-bold text-[#5B5BF0] bg-[#EEF0FE] px-2 py-0.5 rounded border border-[#D5D8FC]">
                  {submittedResult.listing_plan === "featured"
                    ? "Featured Listing ($49)"
                    : submittedResult.listing_plan === "premium"
                    ? "Premium Listing ($29)"
                    : "Free Listing ($0)"}
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <Footer />
    </div>
  );
};

