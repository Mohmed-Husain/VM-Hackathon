import { CheckCircle2, Info } from "lucide-react";
import { IMPORTANT_INFO_ITEMS } from "@/content/homepage-data";

export function ImportantInfo() {
  return (
    <div className="portal-card flex flex-col justify-between border-emerald-200/80 bg-emerald-50/40 p-6 sm:p-7">
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <Info className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold tracking-tight text-emerald-950">Important Information</h3>
        </div>

        <ul className="space-y-3">
          {IMPORTANT_INFO_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-emerald-950/85">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
