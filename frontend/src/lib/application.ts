import type { ApplicationFormData } from "@/types/application";

export const WIZARD_STEPS = [
  { step: 1, title: "Personal", description: "Identity and applicant details" },
  { step: 2, title: "Passport", description: "Passport and issuing details" },
  { step: 3, title: "Travel", description: "Arrival plan and stay details" },
  { step: 4, title: "Documents", description: "Uploads, compression, and OCR" },
  { step: 5, title: "Review", description: "Declaration and sealed submission" },
] as const;

const REQUIRED_PERSONAL_FIELDS = [
  "first_name",
  "last_name",
  "date_of_birth",
  "nationality",
  "gender",
  "marital_status",
  "occupation",
] as const;
const REQUIRED_PASSPORT_FIELDS = [
  "passport_number",
  "issuing_country",
  "issue_date",
  "expiry_date",
] as const;
const REQUIRED_TRAVEL_FIELDS = [
  "intended_arrival_date",
  "port_of_entry",
  "stay_duration_days",
  "accommodation_address",
] as const;
const REQUIRED_DOCUMENT_FIELDS = [
  "passport_scan_ready",
  "applicant_photo_ready",
  "flight_itinerary_ready",
  "hotel_booking_ready",
] as const;

export type ClientValidationSummary = {
  stepErrors: Record<number, Record<string, string>>;
  stepCompletion: Record<number, boolean>;
  isReviewReady: boolean;
  progressPercentage: number;
};

export function createEmptyFormData(): ApplicationFormData {
  return {
    personal: {
      first_name: "",
      last_name: "",
      date_of_birth: "",
      nationality: "",
      gender: "",
      marital_status: "",
      occupation: "",
    },
    passport: {
      passport_number: "",
      issuing_country: "",
      issue_date: "",
      expiry_date: "",
    },
    travel: {
      intended_arrival_date: "",
      port_of_entry: "",
      stay_duration_days: "",
      accommodation_address: "",
    },
    documents: {
      passport_scan_ready: false,
      applicant_photo_ready: false,
      flight_itinerary_ready: false,
      hotel_booking_ready: false,
    },
    review: {
      declaration_accepted: false,
    },
  };
}

function addError(stepErrors: Record<number, Record<string, string>>, step: number, field: string, message: string) {
  if (!stepErrors[step][field]) {
    stepErrors[step][field] = message;
  }
}

function isPresent(value: string | boolean): boolean {
  return typeof value === "boolean" ? value : value.trim().length > 0;
}

function countFilledValues(values: Array<string | boolean>): number {
  return values.filter(isPresent).length;
}

function parseIsoDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addMonths(sourceDate: Date, months: number): Date {
  const next = new Date(sourceDate);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months, 1);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
  return next;
}

export function calculateProgress(formData: ApplicationFormData): number {
  const personal = countFilledValues([
    formData.personal.first_name,
    formData.personal.last_name,
    formData.personal.date_of_birth,
    formData.personal.nationality,
    formData.personal.gender,
    formData.personal.marital_status,
    formData.personal.occupation,
  ]);
  const passport = countFilledValues([
    formData.passport.passport_number,
    formData.passport.issuing_country,
    formData.passport.issue_date,
    formData.passport.expiry_date,
  ]);
  const travel = countFilledValues([
    formData.travel.intended_arrival_date,
    formData.travel.port_of_entry,
    formData.travel.stay_duration_days,
    formData.travel.accommodation_address,
  ]);
  const documents = countFilledValues([
    formData.documents.passport_scan_ready,
    formData.documents.applicant_photo_ready,
    formData.documents.flight_itinerary_ready,
    formData.documents.hotel_booking_ready,
  ]);
  const review = countFilledValues([formData.review.declaration_accepted]);

  const weighted =
    (personal / 7) * 20 +
    (passport / 4) * 25 +
    (travel / 4) * 15 +
    (documents / 4) * 25 +
    review * 15;

  return Math.round(weighted);
}

export function getValidationSummary(formData: ApplicationFormData): ClientValidationSummary {
  const stepErrors: Record<number, Record<string, string>> = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
  };

  for (const field of REQUIRED_PERSONAL_FIELDS) {
    if (!formData.personal[field].trim()) {
      addError(stepErrors, 1, `personal.${field}`, "This field is required.");
    }
  }

  for (const field of REQUIRED_PASSPORT_FIELDS) {
    if (!formData.passport[field].trim()) {
      addError(stepErrors, 2, `passport.${field}`, "This field is required.");
    }
  }

  if (formData.passport.passport_number && !/^[A-Z0-9]{6,9}$/.test(formData.passport.passport_number.toUpperCase())) {
    addError(stepErrors, 2, "passport.passport_number", "Passport number must be 6 to 9 uppercase letters or digits.");
  }

  const issueDate = parseIsoDate(formData.passport.issue_date);
  const expiryDate = parseIsoDate(formData.passport.expiry_date);
  if (formData.passport.issue_date && !issueDate) {
    addError(stepErrors, 2, "passport.issue_date", "Enter a valid issue date.");
  }
  if (formData.passport.expiry_date && !expiryDate) {
    addError(stepErrors, 2, "passport.expiry_date", "Enter a valid expiry date.");
  }
  if (issueDate && expiryDate && issueDate > expiryDate) {
    addError(stepErrors, 2, "passport.expiry_date", "Passport expiry must be after the issue date.");
  }

  for (const field of REQUIRED_TRAVEL_FIELDS) {
    if (!formData.travel[field].trim()) {
      addError(stepErrors, 3, `travel.${field}`, "This field is required.");
    }
  }

  const arrivalDate = parseIsoDate(formData.travel.intended_arrival_date);
  if (formData.travel.intended_arrival_date && !arrivalDate) {
    addError(stepErrors, 3, "travel.intended_arrival_date", "Enter a valid intended arrival date.");
  }
  if (formData.travel.stay_duration_days) {
    const duration = Number(formData.travel.stay_duration_days);
    if (!Number.isInteger(duration) || duration <= 0) {
      addError(stepErrors, 3, "travel.stay_duration_days", "Stay duration must be a positive number of days.");
    }
  }

  if (arrivalDate && expiryDate && expiryDate < addMonths(arrivalDate, 6)) {
    addError(
      stepErrors,
      2,
      "passport.expiry_date",
      "Passport must remain valid for at least 6 months after the intended arrival date.",
    );
  }

  for (const field of REQUIRED_DOCUMENT_FIELDS) {
    if (!formData.documents[field]) {
      addError(stepErrors, 4, `documents.${field}`, "This document is required before review.");
    }
  }

  const priorStepsComplete = [1, 2, 3, 4].every((step) => Object.keys(stepErrors[step]).length === 0);
  if (!formData.review.declaration_accepted) {
    addError(stepErrors, 5, "review.declaration_accepted", "You must accept the declaration before review is complete.");
  }
  if (!priorStepsComplete) {
    addError(stepErrors, 5, "review.readiness", "Complete the earlier steps before the application is review ready.");
  }

  const stepCompletion: Record<number, boolean> = {
    1: Object.keys(stepErrors[1]).length === 0,
    2: Object.keys(stepErrors[2]).length === 0,
    3: Object.keys(stepErrors[3]).length === 0,
    4: Object.keys(stepErrors[4]).length === 0,
    5: Object.keys(stepErrors[5]).length === 0,
  };

  return {
    stepErrors,
    stepCompletion,
    isReviewReady: [1, 2, 3, 4].every((step) => stepCompletion[step]),
    progressPercentage: calculateProgress(formData),
  };
}

export function getStepFieldPaths(step: number): string[] {
  switch (step) {
    case 1:
      return REQUIRED_PERSONAL_FIELDS.map((field) => `personal.${field}`);
    case 2:
      return REQUIRED_PASSPORT_FIELDS.map((field) => `passport.${field}`);
    case 3:
      return REQUIRED_TRAVEL_FIELDS.map((field) => `travel.${field}`);
    case 4:
      return REQUIRED_DOCUMENT_FIELDS.map((field) => `documents.${field}`);
    case 5:
      return ["review.declaration_accepted", "review.readiness"];
    default:
      return [];
  }
}

export function getCategoryLabel(value: string): string {
  switch (value) {
    case "tourist_standard":
      return "Tourist Visa, Standard 30 Days";
    case "tourist_multi_entry":
      return "Tourist Visa, Multi-Entry 90 Days";
    case "business_expedited":
      return "Business Visa, Expedited 30 Days";
    default:
      return value;
  }
}
