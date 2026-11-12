"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  DollarSign,
  X,
  Loader2,
  RefreshCw,
  ChevronDown,
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
    subtitle: "Fully free or open source",
    badge: "100% Free",
    description: "Completely free, open source, or free tier only. No paid plans.",
  },
  {
    value: "freemium",
    label: "Freemium",
    subtitle: "Free tier + paid upgrades",
    badge: "Free + Paid Upgrades",
    description: "Free version with starting paid upgrades or subscription plans.",
  },
  {
    value: "paid",
    label: "Paid",
    subtitle: "Purchase or subscription",
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
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [screenshotsError, setScreenshotsError] = useState<string | null>(null);
  const [isDraggingScreenshots, setIsDraggingScreenshots] = useState(false);

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

  const processLogoFile = (file: File) => {
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processLogoFile(file);
  };

  const processScreenshotsFiles = (selected: File[]) => {
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

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    processScreenshotsFiles(selected);
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

      setSubmittedResult({
        ...data.listing,
        listing_plan: data.listing?.listing_plan || values.listing_plan || "free",
        listing_plan_price: data.listing?.listing_plan_price ?? values.listing_plan_price ?? 0,
      });
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
          theme: { color: "#4F46E5" },
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
        ?.name || "AI";

  const selectedListingPlan = getPlanById(watchedListingPlan || "free");

  const previewSlug =
    submittedResult?.slug ||
    watchedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "your-tool";

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-[#14142B] selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-6 py-8 sm:py-10">
        {/* Back Link & Title Area */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#55556E] hover:text-[#14142B] transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Directory</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14142B] tracking-tight mt-2.5">
            Submit your tool
          </h1>
          <p className="text-sm sm:text-base text-[#55556E] mt-1.5">
            Takes about 3 minutes. No login needed. Your tool goes live after a quick review.
          </p>
        </div>

        {/* Server Error Banner */}
        {serverBannerError && (
          <div
            role="alert"
            className="mb-8 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-3 text-xs sm:text-sm text-[#DC2626]"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Submission Failed</span>
              <span>{serverBannerError}</span>
            </div>
            <button
              type="button"
              onClick={() => setServerBannerError(null)}
              className="text-[#DC2626] hover:opacity-75 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {!submittedResult ? (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Honeypot anti-spam trap (hidden from humans) */}
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
              <label htmlFor="field-company-website-hp">Leave this field empty</label>
              <input
                id="field-company-website-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("company_website_hp")}
              />
            </div>

            {/* LEFT COLUMN: 3 NUMBERED SECTIONS (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* SECTION 1: TOOL DETAILS */}
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-5">
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="h-6 w-6 rounded-full bg-[#14142B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#14142B] leading-tight">
                      Tool details
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E] mt-0.5">
                      The basics people see first.
                    </p>
                  </div>
                </div>

                {/* Row 1: Tool name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="field-name"
                      className="block text-xs font-semibold text-[#14142B] mb-1.5"
                    >
                      Tool name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      id="field-name"
                      type="text"
                      placeholder="e.g. WritePro"
                      {...register("name")}
                      className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                        errors.name
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-[#DC2626]">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="field-category"
                      className="block text-xs font-semibold text-[#14142B] mb-1.5"
                    >
                      Category <span className="text-[#DC2626]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="field-category"
                        disabled={loadingCategories}
                        {...register("category_id")}
                        className={`w-full h-11 appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm font-medium text-[#14142B] focus:outline-none transition-all cursor-pointer ${
                          errors.category_id
                            ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                            : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
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
                            <option value="other">Other (Specify custom category)</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556E] pointer-events-none" />
                    </div>
                    {categoriesError && (
                      <p className="mt-1 text-xs text-[#DC2626]">{categoriesError}</p>
                    )}
                    {errors.category_id && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Conditional Custom Category Field when "Other" is selected */}
                {isOtherCategory && (
                  <div className="rounded-xl border border-[#4F46E5]/25 bg-[#F7F6FF]/30 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="field-custom-category"
                        className="block text-xs font-semibold text-[#14142B]"
                      >
                        Specify Other Category <span className="text-[#DC2626]">*</span>
                      </label>
                      <span className="text-xs font-mono text-[#55556E]">
                        {watchedCustomCategory.length}/{SUBMIT_LIMITS.CUSTOM_CATEGORY_MAX}
                      </span>
                    </div>
                    <input
                      id="field-custom-category"
                      type="text"
                      autoFocus
                      placeholder="e.g. Cybersecurity, LegalTech, Web3, HR Tech"
                      {...register("custom_category")}
                      className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                        errors.custom_category
                          ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                          : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                      }`}
                    />
                    {errors.custom_category && (
                      <p className="mt-1 text-xs text-[#DC2626]">
                        {errors.custom_category.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Row 2: Website URL */}
                <div>
                  <label
                    htmlFor="field-website-url"
                    className="block text-xs font-semibold text-[#14142B] mb-1.5"
                  >
                    Website URL{" "}
                    {isOtherCategory ? (
                      <span className="text-[#55556E] font-normal">(Optional)</span>
                    ) : (
                      <span className="text-[#DC2626]">*</span>
                    )}
                  </label>
                  <input
                    id="field-website-url"
                    type="url"
                    placeholder="https://writepro.ai"
                    {...register("website_url")}
                    className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                      errors.website_url
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                    }`}
                  />
                  {errors.website_url && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.website_url.message}
                    </p>
                  )}
                </div>

                {/* Row 3: Tagline */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-tagline"
                      className="text-xs font-semibold text-[#14142B]"
                    >
                      Tagline <span className="text-[#DC2626]">*</span>
                    </label>
                    <span className="text-xs text-[#55556E] font-mono">
                      {watchedTagline.length}/{SUBMIT_LIMITS.TAGLINE_MAX}
                    </span>
                  </div>
                  <input
                    id="field-tagline"
                    type="text"
                    placeholder="One line that explains what it does"
                    {...register("tagline")}
                    className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                      errors.tagline
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                    }`}
                  />
                  {errors.tagline && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.tagline.message}
                    </p>
                  )}
                </div>

                {/* Row 4: Short description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-description-short"
                      className="text-xs font-semibold text-[#14142B]"
                    >
                      Short description <span className="text-[#DC2626]">*</span>
                    </label>
                    <span className="text-xs text-[#55556E] font-mono">
                      {watchedShortDesc.length}/{SUBMIT_LIMITS.SHORT_DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    id="field-description-short"
                    rows={3}
                    placeholder="Shown on the directory card"
                    {...register("description_short")}
                    className={`w-full rounded-xl border bg-white p-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all min-h-[88px] resize-y ${
                      errors.description_short
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                    }`}
                  />
                  {errors.description_short && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.description_short.message}
                    </p>
                  )}
                </div>

                {/* Row 5: Long description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="field-description-long"
                      className="text-xs font-semibold text-[#14142B]"
                    >
                      Long description <span className="text-[#DC2626]">*</span>
                    </label>
                    <span className="text-xs text-[#55556E] font-mono">
                      {watchedLongDesc.length}/{SUBMIT_LIMITS.LONG_DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    id="field-description-long"
                    rows={5}
                    placeholder="Features, use cases, who it is for"
                    {...register("description_long")}
                    className={`w-full rounded-xl border bg-white p-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all min-h-[140px] resize-y ${
                      errors.description_long
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                    }`}
                  />
                  {errors.description_long && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.description_long.message}
                    </p>
                  )}
                </div>

                {/* Row 6: Your email */}
                <div>
                  <label
                    htmlFor="field-email"
                    className="block text-xs font-semibold text-[#14142B] mb-1.5"
                  >
                    Your email <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    placeholder="maker@writepro.ai"
                    {...register("submitted_by_email")}
                    className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                      errors.submitted_by_email
                        ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                        : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                    }`}
                  />
                  <p className="mt-1.5 text-xs text-[#55556E]">
                    Only used for review updates. Never shown publicly.
                  </p>
                  {errors.submitted_by_email && (
                    <p className="mt-1 text-xs text-[#DC2626]">
                      {errors.submitted_by_email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 2: HOW IS YOUR TOOL PRICED? */}
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-5">
                <span className="sr-only">Software Pricing</span>
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="h-6 w-6 rounded-full bg-[#14142B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#14142B] leading-tight">
                      How is your tool priced?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E] mt-0.5">
                      Just a label for visitors. No payment happens here.
                    </p>
                  </div>
                </div>

                {/* Segmented radio tabs matching the design */}
                <div className="rounded-2xl border border-[#E6E6F0] bg-[#F1F1F8]/70 p-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {SOFTWARE_PRICING_OPTIONS.map((opt) => {
                    const isSelected = watchedPricingModel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
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
                        className={`py-3 px-4 rounded-xl text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#14142B]  border border-[#E6E6F0]"
                            : "text-[#55556E] hover:text-[#14142B] hover:bg-white/60 border border-transparent"
                        }`}
                      >
                        <div className="font-bold text-sm leading-snug">{opt.label}</div>
                        <div className="text-[11px] text-[#55556E] mt-0.5 leading-snug">
                          {opt.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.pricing_model && (
                  <p className="text-xs text-[#DC2626] font-medium">
                    {errors.pricing_model.message}
                  </p>
                )}

                {/* Conditional fields for Freemium and Paid */}
                {(watchedPricingModel === "freemium" ||
                  watchedPricingModel === "paid" ||
                  watchedPricingModel === "premium") && (
                  <div className="rounded-xl border border-[#4F46E5]/25 bg-[#F7F6FF]/25 p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#14142B]">
                      <DollarSign className="h-4 w-4 text-[#4F46E5]" />
                      <span>
                        {watchedPricingModel === "freemium"
                          ? "Freemium Pricing Details"
                          : "Paid Software Pricing Details"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Price in USD ($) */}
                      <div>
                        <label
                          htmlFor="field-starting-price"
                          className="block text-xs font-semibold text-[#14142B] mb-1.5"
                        >
                          {watchedPricingModel === "freemium"
                            ? "Starting Paid-Plan Price (USD $)"
                            : "Software Price (USD $)"}{" "}
                          <span className="text-[#DC2626]">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#55556E]">
                            $
                          </span>
                          <input
                            id="field-starting-price"
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="e.g. 29"
                            {...register("starting_price")}
                            className={`w-full h-11 rounded-xl border bg-white pl-8 pr-3.5 text-sm font-medium text-[#14142B] placeholder:text-[#8A8AA3] focus:outline-none transition-all ${
                              errors.starting_price
                                ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                                : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                            }`}
                          />
                        </div>
                        {errors.starting_price && (
                          <p className="mt-1 text-xs text-[#DC2626]">
                            {errors.starting_price.message}
                          </p>
                        )}
                      </div>

                      {/* Billing Period */}
                      <div>
                        <label
                          htmlFor="field-billing-period"
                          className="block text-xs font-semibold text-[#14142B] mb-1.5"
                        >
                          Billing Period <span className="text-[#DC2626]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="field-billing-period"
                            {...register("billing_period")}
                            className={`w-full h-11 appearance-none rounded-xl border bg-white px-3.5 pr-10 text-sm font-medium text-[#14142B] focus:outline-none transition-all cursor-pointer ${
                              errors.billing_period
                                ? "border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20"
                                : "border-[#D4D4E4] hover:border-[#B9B9CF] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15"
                            }`}
                          >
                            {BILLING_PERIOD_OPTIONS.map((b) => (
                              <option key={b.value} value={b.value}>
                                {b.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#55556E] pointer-events-none" />
                        </div>
                        {errors.billing_period && (
                          <p className="mt-1 text-xs text-[#DC2626]">
                            {errors.billing_period.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-white border border-[#E0DEFC] px-3.5 py-2 text-xs text-[#4F46E5] font-mono flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Example:{" "}
                        <strong className="text-[#14142B]">
                          {watchedPricingModel === "freemium"
                            ? `Freemium software – Starting at $${watchedStartingPrice || 29}/${
                                watchedBillingPeriod === "one_time"
                                  ? "once"
                                  : watchedBillingPeriod === "yearly"
                                  ? "year"
                                  : "month"
                              }`
                            : `Paid software – $${watchedStartingPrice || 49}/${
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

              {/* SECTION 3: LOGO AND SCREENSHOTS */}
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-6 sm:p-7 space-y-6">
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="h-6 w-6 rounded-full bg-[#14142B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#14142B] leading-tight">
                      Logo and screenshots
                    </h2>
                    <p className="text-xs sm:text-sm text-[#55556E] mt-0.5">
                      A clear logo and 2 to 3 screenshots get more views and engagement.
                    </p>
                  </div>
                </div>

                {/* Tool logo dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-[#14142B] mb-2">
                    Tool logo <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />

                  {logoPreview ? (
                    <div className="flex items-center gap-4 p-4 rounded-xl border border-[#E6E6F0] bg-[#F6F6FB]">
                      <div className="h-16 w-16 rounded-xl border border-[#E6E6F0] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-[#14142B] block">
                          {logoFile ? logoFile.name : "Tool logo"}
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="text-[#4F46E5] hover:underline font-medium cursor-pointer"
                          >
                            Change logo
                          </button>
                          <span className="text-[#D4D4E4]">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview("");
                            }}
                            className="text-[#DC2626] hover:underline font-medium cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(true);
                      }}
                      onDragLeave={() => setIsDraggingLogo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processLogoFile(file);
                      }}
                      className={`w-full rounded-2xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-colors ${
                        logoError
                          ? "border-[#DC2626] bg-[#FEF2F2]"
                          : isDraggingLogo
                          ? "border-[#4F46E5] bg-[#F7F6FF]/40"
                          : "border-[#D4D4E4] bg-[#F6F6FB] hover:bg-[#F1F1F8] hover:border-[#55556E]"
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#14142B] block mb-1">
                        Click or drop to upload
                      </span>
                      <span className="text-xs text-[#55556E] block">
                        PNG, JPG, SVG, WebP, GIF · max 5MB
                      </span>
                    </div>
                  )}
                  {logoError && (
                    <p className="mt-1.5 text-xs text-[#DC2626]">{logoError}</p>
                  )}
                </div>

                {/* Screenshots dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#14142B]">
                      Screenshots
                    </label>
                    <span className="text-xs text-[#55556E] font-mono">
                      {screenshotFiles.length}/5
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
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingScreenshots(true);
                      }}
                      onDragLeave={() => setIsDraggingScreenshots(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingScreenshots(false);
                        const files = Array.from(e.dataTransfer.files || []);
                        if (files.length) processScreenshotsFiles(files);
                      }}
                      className={`w-full rounded-2xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-colors ${
                        screenshotsError
                          ? "border-[#DC2626] bg-[#FEF2F2]"
                          : isDraggingScreenshots
                          ? "border-[#4F46E5] bg-[#F7F6FF]/40"
                          : "border-[#D4D4E4] bg-[#F6F6FB] hover:bg-[#F1F1F8] hover:border-[#55556E]"
                      }`}
                    >
                      <span className="text-sm font-semibold text-[#14142B] block mb-1">
                        Add up to 5 screenshots
                      </span>
                      <span className="text-xs text-[#55556E] block">
                        Show your tool&apos;s interface
                      </span>
                    </div>
                  )}

                  {screenshotsError && (
                    <p className="mt-1.5 text-xs text-[#DC2626]">{screenshotsError}</p>
                  )}

                  {screenshotPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {screenshotPreviews.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl border border-[#E6E6F0] overflow-hidden bg-[#F6F6FB] aspect-video"
                        >
                          <img
                            src={src}
                            alt={`Screenshot ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(idx)}
                            className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-[#14142B]/80 text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors cursor-pointer"
                            title="Remove screenshot"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW & LISTING PLAN (4 COLS) */}
            <div className="lg:col-span-4 sticky top-20 space-y-5">
              {/* COMPONENT 1: LIVE PREVIEW */}
              <div>
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#55556E] mb-2 block">
                  LIVE PREVIEW
                </span>

                <div className="rounded-2xl border border-[#E6E6F0] bg-white p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-[#F7F6FF] text-[#4F46E5] border border-[#E0DEFC] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
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

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-[#14142B] truncate">
                            {watchedName || "Your Tool Name"}
                          </h3>
                          <span className="bg-[#FFF1D6] text-[#7A4E00] text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs text-[#55556E] truncate mt-0.5">
                          {watchedTagline || "Your tagline appears here"}
                        </p>
                      </div>
                    </div>

                    <div className="border border-[#E6E6F0] rounded-lg px-2.5 py-1.5 flex flex-col items-center bg-white shrink-0">
                      <span className="text-[9px] text-[#4F46E5] leading-none">▲</span>
                      <span className="text-xs font-bold text-[#14142B] mt-0.5">1</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="rounded-full bg-[#F1F1F8] text-[#55556E] px-2.5 py-0.5 text-xs font-medium">
                      {selectedCategoryName || "AI"}
                    </span>
                    <span className="rounded-full bg-[#F1F1F8] text-[#55556E] px-2.5 py-0.5 text-xs font-medium capitalize">
                      {watchedPricingModel === "paid"
                        ? "Paid"
                        : watchedPricingModel === "freemium"
                        ? "Freemium"
                        : "Free"}
                    </span>
                  </div>
                </div>
              </div>

              {/* COMPONENT 2: LISTING PLAN (PURCHASE & CHECKOUT CARD) */}
              <div className="rounded-2xl border border-[#E6E6F0] bg-white p-5 sm:p-6 space-y-4">
                <span className="sr-only">Choose Your Listing Plan</span>
                <div>
                  <h2 className="font-bold text-lg text-[#14142B] leading-tight">
                    Listing plan
                  </h2>
                  <p className="text-xs text-[#55556E] mt-0.5">
                    Start free anytime. Upgrade for faster review.
                  </p>
                </div>

                {/* 3 Stacked Radio Options */}
                <div className="space-y-2.5">
                  {/* Free ($0) */}
                  <div
                    onClick={() => {
                      setValue("listing_plan", "free", { shouldValidate: true });
                      setValue("listing_plan_price", 0, { shouldValidate: true });
                    }}
                    className={`rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      watchedListingPlan === "free"
                        ? "border-2 border-[#4F46E5] bg-[#F7F6FF]/25 shadow-[0_12px_40px_rgba(20,20,43,0.08)]"
                        : "border border-[#E6E6F0] bg-white hover:border-[#D4D4E4]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          watchedListingPlan === "free"
                            ? "border-[#4F46E5]"
                            : "border-[#D4D4E4]"
                        }`}
                      >
                        {watchedListingPlan === "free" && (
                          <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#14142B]">Free</div>
                        <div className="text-xs text-[#55556E]">Review in 3 to 5 days</div>
                      </div>
                    </div>
                    <div className="font-bold text-base text-[#14142B]">$0</div>
                  </div>

                  {/* Premium ($29) */}
                  <div
                    onClick={() => {
                      setValue("listing_plan", "premium", { shouldValidate: true });
                      setValue("listing_plan_price", 29, { shouldValidate: true });
                    }}
                    className={`rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      watchedListingPlan === "premium"
                        ? "border-2 border-[#4F46E5] bg-[#F7F6FF]/25 shadow-[0_12px_40px_rgba(20,20,43,0.08)]"
                        : "border border-[#E6E6F0] bg-white hover:border-[#D4D4E4]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          watchedListingPlan === "premium"
                            ? "border-[#4F46E5]"
                            : "border-[#D4D4E4]"
                        }`}
                      >
                        {watchedListingPlan === "premium" && (
                          <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#14142B]">Premium</span>
                          <span className="bg-[#4F46E5] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wide">
                            POPULAR
                          </span>
                        </div>
                        <div className="text-xs text-[#55556E]">Review in 24 hours</div>
                      </div>
                    </div>
                    <div className="font-bold text-base text-[#14142B]">$29</div>
                  </div>

                  {/* Featured ($49) */}
                  <div
                    onClick={() => {
                      setValue("listing_plan", "featured", { shouldValidate: true });
                      setValue("listing_plan_price", 49, { shouldValidate: true });
                    }}
                    className={`rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                      watchedListingPlan === "featured"
                        ? "border-2 border-[#4F46E5] bg-[#F7F6FF]/25 shadow-[0_12px_40px_rgba(20,20,43,0.08)]"
                        : "border border-[#E6E6F0] bg-white hover:border-[#D4D4E4]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          watchedListingPlan === "featured"
                            ? "border-[#4F46E5]"
                            : "border-[#D4D4E4]"
                        }`}
                      >
                        {watchedListingPlan === "featured" && (
                          <div className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#14142B]">Featured</div>
                        <div className="text-xs text-[#55556E]">Priority in 12 hours</div>
                      </div>
                    </div>
                    <div className="font-bold text-base text-[#14142B]">$49</div>
                  </div>
                </div>

                {/* Plan Included Checklist Box */}
                <div className="rounded-xl bg-[#F6F6FB] border border-[#F1F1F8] p-4 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#55556E]">
                    {watchedListingPlan === "featured"
                      ? "FEATURED INCLUDES"
                      : watchedListingPlan === "premium"
                      ? "PREMIUM INCLUDES"
                      : "FREE INCLUDES"}
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#55556E]">
                    {watchedListingPlan === "featured" ? (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Priority in 12 hours</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>7 days homepage spotlight</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Featured in founder newsletter</span>
                        </li>
                      </>
                    ) : watchedListingPlan === "premium" ? (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Review in 24 hours</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Verified Maker badge</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Permanent dofollow backlink</span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Standard launch</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Community launch visibility</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-[#0F8A5F] font-bold">✓</span>
                          <span>Permanent searchable listing</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Due Today */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F1F1F8]">
                  <span className="text-sm font-medium text-[#55556E]">Due today</span>
                  <span className="text-2xl font-extrabold text-[#14142B]">
                    {selectedListingPlan?.formattedPrice || "$0"}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isPaymentProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : selectedListingPlan && selectedListingPlan.price > 0 ? (
                    <span>Pay {selectedListingPlan.formattedPrice} and submit →</span>
                  ) : (
                    <span>Submit tool for free →</span>
                  )}
                </button>

                <span className="text-center text-xs text-[#55556E] block">
                  Saved as pending. Public after admin approval.
                </span>
              </div>
            </div>
          </form>
        ) : (
          /* CONFIRMATION VIEW */
          <div className="max-w-2xl mx-auto rounded-2xl border border-[#E6E6F0] bg-white p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-[#ECFDF5] text-[#0F8A5F] border-4 border-[#A7F3D0]">
              <Sparkles className="h-7 w-7 text-[#0F8A5F]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#0F8A5F]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Submission Received • Pending Review
              </span>
 <h2 className="font-heading font-extrabold text-[26px] sm:text-[32px] leading-[1.15] text-[#14142B] tracking-tight">
                {submittedResult.name} is queued for review!
              </h2>
              <p className="text-sm text-[#55556E] max-w-md mx-auto">
                Your tool has been saved with <strong className="text-[#14142B]">pending</strong> status. It will go live after admin approval.
              </p>
            </div>

            <div className="rounded-xl bg-[#F6F6FB] border border-[#E6E6F0] p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#55556E]">Listing ID:</span>
                <span className="font-mono font-bold text-[#14142B] bg-[#F7F6FF] px-2 py-0.5 rounded border border-[#E0DEFC]">
                  {submittedResult.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Public URL Slug:</span>
                <span className="font-mono font-bold text-[#4F46E5]">
                  /product/{submittedResult.slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Status:</span>
                <span className="font-mono font-bold uppercase text-[#7A4E00] bg-[#FFF1D6] px-2 py-0.5 rounded">
                  {submittedResult.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55556E]">Pricing Model:</span>
                <span className="font-mono font-bold text-[#14142B] capitalize">
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
                <span className="text-[#55556E]">Listing Plan:</span>
                <span className="font-mono font-bold text-[#4F46E5] bg-[#F7F6FF] px-2 py-0.5 rounded border border-[#E0DEFC]">
                  {submittedResult.listing_plan === "featured"
                    ? "Featured Listing ($49)"
                    : submittedResult.listing_plan === "premium"
                    ? "Premium Listing ($29)"
                    : "Free Listing ($0)"}
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
                className="w-full sm:w-auto font-bold"
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Submit Another Tool
              </Button>
            </div>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <Footer />
    </div>
  );
};
