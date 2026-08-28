import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Portal Home" },
  { href: "/dashboard", label: "Applicant Dashboard" },
  { href: "/login", label: "Sign In" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Smart eVisa Portal</p>
            <p className="text-sm leading-6 text-slate-300">
              Digital application workspace for visa discovery, profile completion, document upload, and guided
              submission.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>For hackathon demonstration only. Payment gateway remains intentionally hidden in this build.</p>
          <p>Backend API: `backend.evisa.kartik-gupta.site`</p>
        </div>
      </div>
    </footer>
  );
}
