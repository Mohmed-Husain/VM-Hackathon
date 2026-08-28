"use client";

import Link from "next/link";
import { BriefcaseBusiness, Camera, HeartPulse, Users } from "lucide-react";
import { VISA_CATEGORIES } from "@/content/homepage-data";

const ICON_MAP = {
  camera: Camera,
  briefcase: BriefcaseBusiness,
  heart: HeartPulse,
  users: Users,
};

export function VisaCategories() {
  return (
    <section id="visa-categories" className="py-6 sm:py-8">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Visa Types</p>
            <h2 className="card-title">Choose the right eVisa category</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Start with the visa purpose that best matches your trip. Category selection drives the later application
            guidance and supporting document expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {VISA_CATEGORIES.map((category) => {
            const Icon = ICON_MAP[category.icon];
            return (
              <Link key={category.id} href={category.href} className="portal-card group flex flex-col p-5 no-underline">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#2563EB] transition group-hover:bg-[#0B2A6F] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {category.duration}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-950 transition group-hover:text-[#0B2A6F]">
                  {category.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
