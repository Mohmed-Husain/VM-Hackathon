export type VisaCategory = "tourist_standard" | "tourist_multi_entry" | "business_expedited";

export type ApplicationStatus = "Draft" | "In Progress" | "Review Ready" | "Payment Pending" | "Submitted";

export type PersonalDraft = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  marital_status: string;
  occupation: string;
};

export type PassportDraft = {
  passport_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
};

export type TravelDraft = {
  intended_arrival_date: string;
  port_of_entry: string;
  stay_duration_days: string;
  accommodation_address: string;
};

export type DocumentsDraft = {
  passport_scan_ready: boolean;
  applicant_photo_ready: boolean;
  flight_itinerary_ready: boolean;
  hotel_booking_ready: boolean;
};

export type ReviewDraft = {
  declaration_accepted: boolean;
};

export type ValidationIssue = {
  field: string;
  messages: string[];
};

export type StepValidation = {
  step: number;
  is_complete: boolean;
  issues: ValidationIssue[];
};

export type ValidationSummary = {
  is_review_ready: boolean;
  progress_percentage: number;
  steps: StepValidation[];
};

export type SubmittedSnapshot = {
  application_id: string;
  user_id: string;
  visa_category: VisaCategory;
  status: ApplicationStatus;
  submitted_at: string;
  form_data: ApplicationFormData;
  validation_summary: ValidationSummary;
};

export type ApplicationFormData = {
  personal: PersonalDraft;
  passport: PassportDraft;
  travel: TravelDraft;
  documents: DocumentsDraft;
  review: ReviewDraft;
};

export type ApplicationSummary = {
  application_id: string;
  visa_category: VisaCategory;
  status: ApplicationStatus;
  current_step: number;
  progress_percentage: number;
  updated_at: string;
};

export type ApplicationDetail = ApplicationSummary & {
  user_id: string;
  form_data: ApplicationFormData;
  validation_summary: ValidationSummary;
  submitted_at?: string | null;
  submitted_snapshot?: SubmittedSnapshot | null;
  created_at: string;
};

export type CreateApplicationRequest = {
  visa_category: VisaCategory;
};

export type SaveDraftRequest = {
  current_step: number;
  form_data: ApplicationFormData;
};

export type SubmitApplicationResponse = {
  application_id: string;
  status: ApplicationStatus;
  submitted_at: string;
  submitted_snapshot: SubmittedSnapshot;
  message: string;
};

export type LocalDraftSnapshot = {
  application_id: string;
  user_id: string;
  visa_category: VisaCategory;
  current_step: number;
  progress_percentage: number;
  last_synced_at: string;
  is_dirty: boolean;
  form_data: ApplicationFormData;
};
