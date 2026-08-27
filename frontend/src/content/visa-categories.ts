import type { VisaCategory } from "@/types/application";

export const VISA_CATEGORIES: Array<{
  value: VisaCategory;
  title: string;
  duration: string;
  feeLabel: string;
  description: string;
}> = [
  {
    value: "tourist_standard",
    title: "Tourist Visa",
    duration: "Standard, 30 days",
    feeLabel: "$50 demo fee",
    description: "Best for sightseeing, family visits, and short leisure travel in the MVP flow.",
  },
  {
    value: "tourist_multi_entry",
    title: "Tourist Visa",
    duration: "Multi-entry, 90 days",
    feeLabel: "$85 demo fee",
    description: "For applicants who expect more flexible entry across a longer itinerary window.",
  },
  {
    value: "business_expedited",
    title: "Business Visa",
    duration: "Expedited, 30 days",
    feeLabel: "$120 demo fee",
    description: "Optimized for business-purpose travel in the prototype experience.",
  },
];
