import type { LoginResponse, StoredSession } from "@/types/auth";

const SESSION_STORAGE_KEY = "smart-evisa-session";

export function saveSession(payload: LoginResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  const session: StoredSession = {
    accessToken: payload.access_token,
    tokenType: payload.token_type,
    expiresIn: payload.expires_in,
    user: payload.user,
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Aliases
export const loadStoredSession = getSession;
export const clearStoredSession = clearSession;
