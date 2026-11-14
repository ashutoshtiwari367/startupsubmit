"use client";

import React, { Suspense } from "react";
import { WinnersPageView } from "@/components/WinnersPageView";

export default function WinnersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6FB] flex items-center justify-center">
          <div className="text-sm font-mono text-[#55556E]">Loading Hall of Winners...</div>
        </div>
      }
    >
      <WinnersPageView />
    </Suspense>
  );
}
