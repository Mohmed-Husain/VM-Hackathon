import type { LoginRequest, LoginResponse, SessionUser } from "@/types/auth";
import type {
  ApplicationDetail,
  ApplicationSummary,
  CreateApplicationRequest,
  SaveDraftRequest,
} from "@/types/application";
import type { ApplicationDocument, DocumentType } from "@/types/document";
import type { ApplicantProfile, ProfilePayload } from "@/types/profile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Request failed.";

    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      detail = response.statusText || detail;
    }

    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<LoginResponse>(response);
}

export async function getCurrentUser(accessToken: string): Promise<SessionUser> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return parseJson<SessionUser>(response);
}

export async function getApplications(accessToken: string): Promise<ApplicationSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return parseJson<ApplicationSummary[]>(response);
}

export async function createApplication(
  accessToken: string,
  payload: CreateApplicationRequest,
): Promise<ApplicationDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<ApplicationDetail>(response);
}

export async function getApplication(accessToken: string, applicationId: string): Promise<ApplicationDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/${applicationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return parseJson<ApplicationDetail>(response);
}

export async function saveApplicationDraft(
  accessToken: string,
  applicationId: string,
  payload: SaveDraftRequest,
): Promise<ApplicationDetail> {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/${applicationId}/draft`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<ApplicationDetail>(response);
}

export async function getProfile(accessToken: string): Promise<ApplicantProfile | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  return parseJson<ApplicantProfile>(response);
}

export async function saveProfile(accessToken: string, payload: ProfilePayload): Promise<ApplicantProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseJson<ApplicantProfile>(response);
}

export async function getDocuments(accessToken: string, applicationId: string): Promise<ApplicationDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/applications/${applicationId}/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  return parseJson<ApplicationDocument[]>(response);
}

export async function uploadDocument(
  accessToken: string,
  applicationId: string,
  documentType: DocumentType,
  file: File,
): Promise<ApplicationDocument> {
  const formData = new FormData();
  formData.append("application_id", applicationId);
  formData.append("document_type", documentType);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  return parseJson<ApplicationDocument>(response);
}

export async function deleteDocument(accessToken: string, documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    let detail = "Unable to delete the document.";
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      detail = response.statusText || detail;
    }

    throw new Error(detail);
  }
}
