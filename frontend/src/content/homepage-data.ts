export type HomeLinkCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: "file" | "resume" | "search" | "upload" | "shield" | "help";
};

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
  icon: "profile" | "passport" | "travel" | "documents" | "review";
};

export type VisaCategoryCard = {
  id: string;
  title: string;
  description: string;
  duration: string;
  href: string;
  icon: "camera" | "briefcase" | "heart" | "users";
};

export type SupportCard = {
  title: string;
  description: string;
  href: string;
  icon: "shield" | "file" | "help";
};

export const ACTION_CARDS: HomeLinkCard[] = [
  {
    id: "apply",
    title: "Apply Now",
    description: "Start a fresh eVisa application with the guided wizard.",
    href: "/login",
    icon: "file",
  },
  {
    id: "resume",
    title: "Resume Draft",
    description: "Continue a saved application from your dashboard.",
    href: "/dashboard",
    icon: "resume",
  },
  {
    id: "status",
    title: "Check Status",
    description: "Review active drafts and submitted applications.",
    href: "/dashboard",
    icon: "search",
  },
  {
    id: "documents",
    title: "Upload Documents",
    description: "Manage passport scans, photographs, and supporting files.",
    href: "/dashboard",
    icon: "upload",
  },
  {
    id: "eligibility",
    title: "Eligibility",
    description: "Explore the supported visa categories before you apply.",
    href: "#visa-categories",
    icon: "shield",
  },
  {
    id: "support",
    title: "Help Centre",
    description: "Access applicant guidance and support information.",
    href: "#help-support",
    icon: "help",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Profile Details",
    description: "Enter applicant information exactly as shown on the passport.",
    icon: "profile",
  },
  {
    step: 2,
    title: "Passport Details",
    description: "Capture passport metadata and validate key travel document fields.",
    icon: "passport",
  },
  {
    step: 3,
    title: "Travel Plan",
    description: "Add intended arrival details, visit purpose, and itinerary basics.",
    icon: "travel",
  },
  {
    step: 4,
    title: "Document Uploads",
    description: "Upload the passport scan, photo, and any required supporting files.",
    icon: "documents",
  },
  {
    step: 5,
    title: "Review & Submit",
    description: "Run final checks and submit once every section is complete.",
    icon: "review",
  },
];

export const VISA_CATEGORIES: VisaCategoryCard[] = [
  {
    id: "tourist",
    title: "e-Tourist Visa",
    description: "Sightseeing, casual visits, and short leisure travel.",
    duration: "Up to 30 days",
    href: "/dashboard",
    icon: "camera",
  },
  {
    id: "business",
    title: "e-Business Visa",
    description: "Business meetings, trade activity, and market visits.",
    duration: "Up to 1 year",
    href: "/dashboard",
    icon: "briefcase",
  },
  {
    id: "medical",
    title: "e-Medical Visa",
    description: "Medical treatment, consultations, and hospital visits.",
    duration: "Case-based",
    href: "/dashboard",
    icon: "heart",
  },
  {
    id: "conference",
    title: "e-Conference Visa",
    description: "Official conferences, summits, and academic participation.",
    duration: "Event-based",
    href: "/dashboard",
    icon: "users",
  },
];

export const ADVISORY_ITEMS: string[] = [
  "Applicants should use the same passport for travel that was used during the application.",
  "Uploaded passport scans and photographs must be clear, recent, and readable.",
  "Applicants are advised to verify arrival dates and port of entry details before submission.",
  "Payment gateway integration remains intentionally disabled in this MVP build.",
];

export const IMPORTANT_INFO_ITEMS: string[] = [
  "Drafts can be resumed later from the applicant dashboard after sign-in.",
  "Passport OCR assists with extraction, but applicants remain responsible for final accuracy.",
  "Visa approval decisions and final eligibility always depend on official review criteria.",
  "Submitted applications preserve a sealed snapshot for later reference.",
];

export const HELP_CARDS: SupportCard[] = [
  {
    title: "Application Guidance",
    description: "Understand the 5-step workflow and draft completion rules.",
    href: "/login",
    icon: "file",
  },
  {
    title: "Security & Identity",
    description: "Review authentication and applicant profile expectations.",
    href: "/dashboard",
    icon: "shield",
  },
  {
    title: "Support Resources",
    description: "Find help touchpoints and readiness reminders before submission.",
    href: "#useful-links",
    icon: "help",
  },
];

export const USEFUL_LINKS = [
  { title: "Official Indian Visa Information", url: "https://indianvisaonline.gov.in/" },
  { title: "Government of India Portal", url: "https://www.india.gov.in/" },
  { title: "Bureau of Immigration", url: "https://boi.gov.in/" },
  { title: "Incredible India Travel Guide", url: "https://www.incredibleindia.gov.in/" },
];
