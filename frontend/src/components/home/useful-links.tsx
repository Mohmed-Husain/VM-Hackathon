import { Building2, ExternalLink } from "lucide-react";
import { USEFUL_LINKS } from "@/content/homepage-data";

export function UsefulLinks() {
  return (
    <div id="useful-links" className="portal-card flex flex-col justify-between bg-white p-6 sm:p-7">
      <div>
        <div className="mb-5 border-b border-slate-100 pb-4">
          <p className="eyebrow">Reference Links</p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">Official and travel resources</h3>
        </div>

        <div className="space-y-3">
          {USEFUL_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 no-underline transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB]">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="truncate text-sm font-semibold text-slate-900">{link.title}</span>
              </div>
              <ExternalLink className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
