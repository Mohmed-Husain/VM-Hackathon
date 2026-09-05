export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  captcha_challenge_id?: string;
  captcha_answer?: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  captcha_challenge_id: string;
  captcha_answer: string;
};

export type CaptchaChallenge = {
  challenge_id: string;
  image_base64: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: SessionUser;
};

export type StoredSession = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: SessionUser;
};

