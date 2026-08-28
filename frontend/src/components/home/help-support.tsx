"use client";

import Link from "next/link";
import { CircleHelp, FileText, Phone, ShieldCheck } from "lucide-react";
import { HELP_CARDS } from "@/content/homepage-data";

const ICON_MAP = {
  shield: ShieldCheck,
  file: FileText,
  help: CircleHelp,
};

export function HelpSupport() {
  return (
    <div id="help-support" className="portal-card flex flex-col justify-between bg-white p-6 sm:p-7">
      <div>
        <div className="mb-5 border-b border-slate-100 pb-4">
          <p className="eyebrow">Support</p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">Help and applicant readiness</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {HELP_CARDS.map((card) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 no-underline transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold text-slate-950">{card.title}</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{card.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Submission Note</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Payment UI remains hidden in this MVP until gateway integration is approved.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Phone className="h-3.5 w-3.5" />
              <span>Support Readiness</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Review passport validity, travel dates, and uploads before final submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
