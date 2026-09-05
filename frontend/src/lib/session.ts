import type { LoginResponse, StoredSession } from "@/types/auth";

const SESSION_STORAGE_KEY = "smart-evisa-session";

let memorySession: StoredSession | null = null;

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
  memorySession = session;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Safari private mode quota exceeded fallback
  }
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") {
    return null;
    return memorySession;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return memorySession;
    }
    return JSON.parse(raw) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
    return memorySession;
  }
}

export function clearSession(): void {
  memorySession = null;
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Safari fallback
  }
}


// Aliases
export const loadStoredSession = getSession;
export const clearStoredSession = clearSession;
