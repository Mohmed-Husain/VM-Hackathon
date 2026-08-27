import type { ApplicationDetail, ApplicationFormData, LocalDraftSnapshot } from "@/types/application";

const STORAGE_PREFIX = "evisa_draft_";

export function getDraftStorageKey(applicationId: string): string {
  return `${STORAGE_PREFIX}${applicationId}`;
}

export function buildLocalDraftSnapshot(
  application: ApplicationDetail,
  formData: ApplicationFormData,
  currentStep: number,
  progressPercentage: number,
  isDirty: boolean,
  lastSyncedAt: string,
): LocalDraftSnapshot {
  return {
    application_id: application.application_id,
    user_id: application.user_id,
    visa_category: application.visa_category,
    current_step: currentStep,
    progress_percentage: progressPercentage,
    last_synced_at: lastSyncedAt,
    is_dirty: isDirty,
    form_data: formData,
  };
}

export function readLocalDraft(applicationId: string): LocalDraftSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(getDraftStorageKey(applicationId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalDraftSnapshot;
  } catch {
    window.localStorage.removeItem(getDraftStorageKey(applicationId));
    return null;
  }
}

export function writeLocalDraft(snapshot: LocalDraftSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getDraftStorageKey(snapshot.application_id), JSON.stringify(snapshot));
}

export function clearLocalDraft(applicationId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(applicationId));
}
