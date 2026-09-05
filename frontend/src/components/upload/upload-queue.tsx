import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

export interface QueueItem {
  id: string;
  name: string;
  typeLabel: string;
  progress: number;
  stage: "compressing" | "uploading" | "ocr" | "done" | "error";
  originalSize?: string;
  compressedSize?: string;
  ratio?: number;
  error?: string;
}

interface UploadQueueProps {
  items: QueueItem[];
}

export function UploadQueue({ items }: UploadQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Upload &amp; Optimization Queue
        </span>
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#0B2A6F]">
          {items.filter((i) => i.stage === "done").length} of {items.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                {item.stage === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : item.stage === "error" ? (
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" />
                )}
                <span>{item.typeLabel}</span>
                <span className="text-[11px] text-slate-400">({item.name})</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">
                {item.stage === "compressing" && "Optimizing..."}
                {item.stage === "uploading" && `${item.progress}%`}
                {item.stage === "ocr" && "Extracting OCR..."}
                {item.stage === "done" && "Complete ✓"}
                {item.stage === "error" && "Failed"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-300 ${
                  item.stage === "done"
                    ? "bg-emerald-600"
                    : item.stage === "error"
                    ? "bg-rose-500"
                    : "bg-[#2563EB]"
                }`}
                style={{
                  width: `${item.stage === "done" ? 100 : item.progress}%`,
                }}
              />
            </div>

            {/* Optimization stats badge */}
            {item.stage === "done" && item.originalSize && item.compressedSize ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                <Sparkles className="h-3 w-3" />
                <span>
                  Compressed: {item.originalSize} → {item.compressedSize}{" "}
                  {item.ratio ? `(${Math.round(item.ratio * 100)}% reduction)` : ""}
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

