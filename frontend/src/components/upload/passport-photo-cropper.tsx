"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Check, Crop, RotateCw, Sparkles, X, ZoomIn } from "lucide-react";

// Suppress benign Emscripten / TFLite stderr informational notices from triggering Next.js dev error overlays
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (
      first.includes("TensorFlow Lite") ||
      first.includes("XNNPACK") ||
      first.startsWith("INFO:")
    ) {
      console.info(...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

interface PassportPhotoCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob, croppedUrl: string) => void;
  onCancel: () => void;
}

export function PassportPhotoCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: PassportPhotoCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAutoFitting, setIsAutoFitting] = useState(false);

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const onCropAreaChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleAutoFitFace = async () => {
    setIsAutoFitting(true);
    try {
      // Attempt MediaPipe Face Detection if browser environment supports it
      try {
        const { FaceDetector, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          },
          runningMode: "IMAGE",
        });

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }

        const detections = detector.detect(img);
        if (typeof detector.close === "function") {
          try {
            detector.close();
          } catch {
            // ignore close error
          }
        }

        const width = img.naturalWidth || img.width || 500;
        const height = img.naturalHeight || img.height || 500;

        if (detections.detections.length > 0 && detections.detections[0].boundingBox) {
          const box = detections.detections[0].boundingBox;
          // Calculate center
          const faceCenterX = box.originX + box.width / 2;
          const faceCenterY = box.originY + box.height / 2;

          // Normalized offset relative to image center
          const offsetX = ((faceCenterX - width / 2) / width) * 100;
          const offsetY = ((faceCenterY - height / 2) / height) * 100;

          setCrop({ x: -offsetX, y: -offsetY });
          setZoom(1.3);
          return;
        }
      } catch {
        // Fallback to center-crop if MediaPipe model CDN is inaccessible
        // Fallback to center-crop if MediaPipe model CDN is inaccessible or fails
      }

      // Default smart center-fit
      setCrop({ x: 0, y: -5 });
      setZoom(1.2);
    } finally {
      setIsAutoFitting(false);
    }
  };

  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Minimum 350x350 output resolution for passport photo requirements
    const targetSize = Math.max(350, Math.min(croppedAreaPixels.width, 800));
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      targetSize,
      targetSize
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(blob, croppedUrl);
      },
      "image/jpeg",
      0.9
    );
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B2A6F]">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Passport Photo 1:1 Cropper
              </h3>
              <p className="text-[11px] text-slate-500">
                Position face inside standard government 1:1 square frame
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cropper Workspace */}
        <div className="relative h-72 w-full bg-slate-950 sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaChange}
            onZoomChange={setZoom}
            showGrid={true}
            cropShape="rect"
          />

          {/* Biometric Oval Guide Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-36 rounded-full border-2 border-dashed border-blue-400/60 shadow-inner" />
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 bg-slate-50 p-4">
          {/* Zoom & Rotate Sliders */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2">
              <ZoomIn className="h-4 w-4 text-slate-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#0B2A6F]"
              />
            </div>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Rotate
            </button>
          </div>

          {/* Smart Auto-Fit Button */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={handleAutoFitFace}
              disabled={isAutoFitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0B2A6F] hover:bg-blue-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
              {isAutoFitting ? "Detecting face..." : "AI Auto-Center Face"}
            </button>
            <span className="text-[11px] text-slate-500">
              Min. 350x350 px output
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={createCroppedImage}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B2A6F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#081E4F]"
          >
            <Check className="h-4 w-4" />
            Apply 1:1 Crop
          </button>
        </div>
      </div>
    </div>
  );
}

