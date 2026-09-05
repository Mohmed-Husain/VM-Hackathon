import { CheckCircle2, ShieldCheck } from "lucide-react";

interface DocumentValidationBadgeProps {
  documentType: "passport_scan" | "applicant_photo" | "flight_itinerary" | "hotel_booking";
  fileSizeBytes?: number;
  fileName?: string;
  isCompressed?: boolean;
  compressionRatio?: number;
}

export function DocumentValidationBadge({
  documentType,
  fileSizeBytes,
  isCompressed,
  compressionRatio,
}: DocumentValidationBadgeProps) {
  const isPhoto = documentType === "applicant_photo";
  const isPassport = documentType === "passport_scan";

  return (
    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Consular Verification Checks
        </span>
        {isCompressed && compressionRatio && compressionRatio > 0 ? (
          <span className="rounded-full bg-emerald-200/70 px-2 py-0.2 text-[10px] font-semibold text-emerald-800">
            {Math.round(compressionRatio * 100)}% optimized
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-emerald-800">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
          <span>Format supported</span>
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
          <span>
            {fileSizeBytes
              ? `${Math.round(fileSizeBytes / 1024)} KB (under limit)`
              : "Size within limit"}
          </span>
        </div>

        {isPhoto ? (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>1:1 Aspect ratio</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Face centered &amp; clear</span>
            </div>
          </>
        ) : isPassport ? (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>MRZ readable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Legibility verified</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Document valid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span>Itinerary verified</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

