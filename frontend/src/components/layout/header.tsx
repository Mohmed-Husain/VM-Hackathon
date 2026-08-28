import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard", label: "Applications" },
  { href: "/login", label: "Login" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-sm font-bold text-[#0B2A6F]">
            IN
          </div>
          <div>
            <Link href="/" className="text-base font-semibold text-slate-950">
              Smart eVisa Portal
            </Link>
            <p className="text-sm text-slate-500">Official-style digital visa assistance experience</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link href="/dashboard" className="btn-primary">
            Continue Application
          </Link>
        </div>

        <MobileNav items={NAV_ITEMS} />
      </div>
    </header>
  );
}
