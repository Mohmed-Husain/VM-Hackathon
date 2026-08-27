export type ApplicantProfile = {
  profile_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  marital_status: string;
  occupation: string;
  passport_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
};

export type ProfilePayload = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  marital_status: string;
  occupation: string;
  passport_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
};
