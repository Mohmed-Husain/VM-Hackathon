"use client";

import { BadgeCheck, FileSearch, FileUp, PlaneTakeoff, UserRound } from "lucide-react";
import { PROCESS_STEPS } from "@/content/homepage-data";

const ICON_MAP = {
  profile: UserRound,
  passport: FileSearch,
  travel: PlaneTakeoff,
  documents: FileUp,
  review: BadgeCheck,
};

export function ProcessStepper() {
  return (
    <section className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="portal-card p-6 sm:p-8">
          <div className="mb-8 flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Application Journey</p>
              <h2 className="card-title">Complete the eVisa flow step by step</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Each stage collects only the information needed for the next review step, which keeps the experience
              faster and easier to validate.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {PROCESS_STEPS.map((step) => {
              const Icon = ICON_MAP[step.icon];
              return (
                <div key={step.step} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B2A6F] text-sm font-bold text-white">
                      {step.step}
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white text-[#2563EB]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
