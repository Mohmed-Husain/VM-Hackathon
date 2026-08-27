export type SessionUser = {
  id: string;
  email: string;
  full_name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
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
