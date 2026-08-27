export type DocumentType = "passport_scan" | "applicant_photo" | "flight_itinerary" | "hotel_booking";

export type ApplicationDocument = {
  document_id: string;
  application_id: string;
  document_type: DocumentType;
  file_name: string;
  storage_path: string;
  public_url: string;
  content_type: string;
  file_size_bytes: number;
  created_at: string;
};
