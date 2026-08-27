import type { DocumentType } from "@/types/document";

const ONE_MB = 1024 * 1024;
const PASSPORT_PDF_HINT_MAX_BYTES = 300 * 1024;
const COMPRESSIBLE_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

export type PreparedDocumentUpload = {
  file: File;
  notes: string[];
};

export async function prepareDocumentUpload(
  documentType: DocumentType,
  file: File,
): Promise<PreparedDocumentUpload> {
  const notes: string[] = [];

  if (file.type === "application/pdf") {
    if (documentType === "passport_scan") {
      notes.push("Passport PDF uploads are sent as-is. The official portal commonly shows a 300 KB passport PDF guideline.");
      if (file.size > PASSPORT_PDF_HINT_MAX_BYTES) {
        notes.push("This PDF is larger than that common guideline, so an image upload may work better in the demo.");
      }
    }

    return { file, notes };
  }

  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
    return { file, notes: ["This file type is uploaded without client-side compression."] };
  }

  const compressedFile = await compressImageFile(file, ONE_MB);

  if (compressedFile.size < file.size) {
    notes.push(`Compressed before upload: ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)}.`);
  } else {
    notes.push(`Image already fits the upload target at ${formatFileSize(file.size)}.`);
  }

  if (documentType === "applicant_photo") {
    notes.push("Photo reminder: use a square, front-facing image with a plain light or white background.");
  }

  return {
    file: compressedFile,
    notes,
  };
}

async function compressImageFile(file: File, targetMaxBytes: number): Promise<File> {
  if (file.size <= targetMaxBytes && file.type !== "image/png") {
    return file;
  }

  const image = await loadImage(file);
  let width = image.naturalWidth;
  let height = image.naturalHeight;
  const longestSide = Math.max(width, height);

  if (longestSide > 1800) {
    const ratio = 1800 / longestSide;
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = 0.92;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > targetMaxBytes && quality > 0.46) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > targetMaxBytes) {
    const shrinkRatio = 0.85;
    canvas.width = Math.max(1, Math.round(width * shrinkRatio));
    canvas.height = Math.max(1, Math.round(height * shrinkRatio));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    quality = 0.82;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size >= file.size) {
    return file;
  }

  return new File([blob], replaceFileExtension(file.name, "jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load the selected image."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress the selected image."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

function replaceFileExtension(fileName: string, nextExtension: string): string {
  const index = fileName.lastIndexOf(".");
  if (index === -1) {
    return `${fileName}.${nextExtension}`;
  }

  return `${fileName.slice(0, index)}.${nextExtension}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < ONE_MB) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / ONE_MB).toFixed(2)} MB`;
}
