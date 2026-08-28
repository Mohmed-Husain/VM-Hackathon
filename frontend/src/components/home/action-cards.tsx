"use client";

import Link from "next/link";
import { ArrowRight, CircleHelp, FilePlus2, FolderClock, Search, ShieldCheck, UploadCloud } from "lucide-react";
import { ACTION_CARDS } from "@/content/homepage-data";

const ICON_MAP = {
  file: FilePlus2,
  resume: FolderClock,
  search: Search,
  upload: UploadCloud,
  shield: ShieldCheck,
  help: CircleHelp,
};

export function ActionCards() {
  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Quick Actions</p>
            <h2 className="card-title">I want to...</h2>
          </div>
          <p className="hidden max-w-md text-right text-sm text-slate-500 md:block">
            Navigate directly to common applicant tasks without hunting through the portal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ACTION_CARDS.map((card) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <Link
                key={card.id}
                href={card.href}
                className="portal-card group flex min-h-[168px] flex-col justify-between p-5 no-underline"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-[#2563EB] transition group-hover:scale-105 group-hover:bg-[#0B2A6F] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950 transition group-hover:text-[#0B2A6F]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                  <span>Open</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
