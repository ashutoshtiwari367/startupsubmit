"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductDetailView } from "@/components/ProductDetailView";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import NotFound from "@/app/not-found";

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const isMockProduct = MOCK_PRODUCTS.some((p) => p.id === id);
  const [status, setStatus] = useState<"loading" | "approved" | "not_found">(
    isMockProduct ? "approved" : "loading"
  );

  useEffect(() => {
    if (isMockProduct) {
      setStatus("approved");
      return;
    }

    let active = true;
    fetch(`/api/listings?slug=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setStatus("approved");
        } else {
          // Pending or non-existent listings return 404 from /api/listings
          setStatus("not_found");
        }
      })
      .catch(() => {
        if (active) setStatus("not_found");
      });

    return () => {
      active = false;
    };
  }, [id, isMockProduct]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center text-xs font-mono text-[#66666B]">
        Checking listing status...
      </div>
    );
  }

  if (status === "not_found") {
    return <NotFound />;
  }

  return <ProductDetailView productId={id} />;
}
