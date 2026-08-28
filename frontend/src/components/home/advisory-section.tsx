import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ADVISORY_ITEMS } from "@/content/homepage-data";

export function AdvisorySection() {
  return (
    <div className="portal-card flex flex-col justify-between border-amber-200/80 bg-amber-50/50 p-6 sm:p-7">
      <div>
        <div className="mb-4 flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold tracking-tight text-amber-950">Important Advisory</h3>
        </div>

        <ul className="space-y-3">
          {ADVISORY_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-amber-950/85">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
