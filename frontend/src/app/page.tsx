"use client";

import React, { useEffect, useState } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { ActionCards } from "@/components/home/action-cards";
import { ProcessStepper } from "@/components/home/process-stepper";
import { VisaCategories } from "@/components/home/visa-categories";
import { AdvisorySection } from "@/components/home/advisory-section";
import { ImportantInfo } from "@/components/home/important-info";
import { HelpSupport } from "@/components/home/help-support";
import { UsefulLinks } from "@/components/home/useful-links";
import { VisaAssistantWidget } from "@/components/assistant/visa-assistant-widget";
import { loadStoredSession } from "@/lib/session";

export default function HomePage() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const session = loadStoredSession();
    if (session?.accessToken) {
      setToken(session.accessToken);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* 1. Hero Section */}
      <HeroSection />

      <div className="flex-1 space-y-2 pb-16">
        {/* 2. "I want to..." Action Cards */}
        <ActionCards />

        {/* 3. E-Visa Application Process Stepper */}
        <ProcessStepper />

        {/* 4. Choose your eVisa Category */}
        <VisaCategories />

        {/* 5. Official Notices Row (Advisory + Important Information) */}
        <section className="py-6 sm:py-8">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdvisorySection />
              <ImportantInfo />
            </div>
          </div>
        </section>

        {/* 6. Support & Resources Row (Help & Support + Useful Links) */}
        <section className="py-6 sm:py-8">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HelpSupport />
              <UsefulLinks />
            </div>
          </div>
        </section>
      </div>

      {/* Floating AI Visa Assistant */}
      <VisaAssistantWidget accessToken={token} />
    </div>
  );
}
