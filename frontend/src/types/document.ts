export type DocumentType = "passport_scan" | "applicant_photo" | "flight_itinerary" | "hotel_booking";

export type PassportOcrFields = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
};

export type PassportOcrExtraction = {
  status: "completed";
  source: "simulated";
  extracted_at: string;
  confidence_score: number;
  extracted_fields: PassportOcrFields;
  advisory_notes: string[];
};

export type PassportOcrResponse = PassportOcrExtraction & {
  document_id: string;
  application_id: string;
};

export type ApplicationDocument = {
  document_id: string;
  application_id: string;
  document_type: DocumentType;
  file_name: string;
  storage_path: string;
  public_url: string;
  content_type: string;
  file_size_bytes: number;
  ocr_extraction?: PassportOcrExtraction | null;
  created_at: string;
};
