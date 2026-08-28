import Link from "next/link";

type MobileNavItem = {
  href: string;
  label: string;
};

type MobileNavProps = {
  items: MobileNavItem[];
};

export function MobileNav({ items }: MobileNavProps) {
  return (
    <div className="flex md:hidden">
      <div className="flex flex-wrap justify-end gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
