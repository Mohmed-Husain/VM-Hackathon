"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Check } from "lucide-react";
import { VisaAssistantWidget } from "@/components/assistant/visa-assistant-widget";
import { ProtectedPage } from "@/components/auth/protected-page";
import { ReviewSubmissionPanel, type ReviewSection } from "@/components/wizard/review-submission-panel";
import { PassportPhotoCropper } from "@/components/upload/passport-photo-cropper";
import { DocumentValidationBadge } from "@/components/upload/document-validation-badge";
import { UploadQueue, type QueueItem } from "@/components/upload/upload-queue";

import {
  WIZARD_STEPS,
  calculateProgress,
  createEmptyFormData,
  getCategoryLabel,
  getStepFieldPaths,
  getValidationSummary,
  sanitizePassportNumber,
} from "@/lib/application";

import {
  deleteDocument,
  getApplication,
  getDocuments,
  getProfile,
  runPassportOcr,
  saveApplicationDraft,
  saveProfile,
  submitApplication,
  uploadDocument,
} from "@/lib/api";
import { buildLocalDraftSnapshot, readLocalDraft, writeLocalDraft } from "@/lib/draft-storage";
import { prepareDocumentUpload } from "@/lib/image-processing";
import { clearSession } from "@/lib/session";
import type { ApplicationDetail, ApplicationFormData } from "@/types/application";
import type { StoredSession } from "@/types/auth";
import type { ApplicationDocument, DocumentType, PassportOcrExtraction, PassportOcrResponse } from "@/types/document";
import type { ApplicantProfile, ProfilePayload } from "@/types/profile";

type SaveMode = "manual" | "autosave" | "navigation" | "ocr";
type UploadState = "idle" | "compressing" | "uploading" | "ocr";
type PassportOcrPreview = PassportOcrExtraction | PassportOcrResponse;

const DOCUMENT_CARDS: Array<{
  type: DocumentType;
  title: string;
  description: string;
  accept: string;
}> = [
  {
    type: "passport_scan",
    title: "Passport Bio Page",
    description: "Upload the passport bio page with photograph and personal details.",
    accept: ".jpg,.jpeg,.png,.pdf",
  },
  {
    type: "applicant_photo",
    title: "Applicant Photo",
    description: "Use a recent front-facing photo with a plain light or white background.",
    accept: ".jpg,.jpeg,.png",
  },
  {
    type: "flight_itinerary",
    title: "Flight Itinerary",
    description: "Add the itinerary or booking confirmation used for the trip plan.",
    accept: ".jpg,.jpeg,.png,.pdf",
  },
  {
    type: "hotel_booking",
    title: "Hotel Booking",
    description: "Add accommodation proof or a hotel booking confirmation.",
    accept: ".jpg,.jpeg,.png,.pdf",
  },
];

export function ApplicationWizardShell({ applicationId }: Readonly<{ applicationId: string }>) {
  return <ProtectedPage>{(session) => <ApplicationWizardContent session={session} applicationId={applicationId} />}</ProtectedPage>;
}

function ApplicationWizardContent({
  session,
  applicationId,
}: Readonly<{
  session: StoredSession;
  applicationId: string;
}>) {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [draft, setDraft] = useState<ApplicationFormData>(createEmptyFormData());
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [highestStepUnlocked, setHighestStepUnlocked] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStateByType, setUploadStateByType] = useState<Record<DocumentType, UploadState>>({
    passport_scan: "idle",
    applicant_photo: "idle",
    flight_itinerary: "idle",
    hotel_booking: "idle",
  });
  const [uploadNotes, setUploadNotes] = useState<Partial<Record<DocumentType, string>>>({});
  const [latestPassportOcr, setLatestPassportOcr] = useState<PassportOcrPreview | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [cropperFile, setCropperFile] = useState<{ file: File; src: string } | null>(null);
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);


  const draftRef = useRef(draft);
  const stepRef = useRef(activeStep);
  const savingRef = useRef(isSaving);
  const dirtyRef = useRef(isDirty);
  const applicationRef = useRef(application);
  const persistDraftRef = useRef<(mode: SaveMode, nextStep: number, nextDraft: ApplicationFormData) => Promise<boolean>>(
    async () => false,
  );

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    stepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    savingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    applicationRef.current = application;
  }, [application]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [response, savedProfile, applicationDocuments] = await Promise.all([
          getApplication(session.accessToken, applicationId),
          getProfile(session.accessToken),
          getDocuments(session.accessToken, applicationId),
        ]);

        if (cancelled) {
          return;
        }

        const localSnapshot = readLocalDraft(applicationId);
        let nextDraft = response.form_data;
        let nextStep = response.current_step;
        let nextDirty = false;
        let nextLastSyncedAt = response.updated_at;
        let nextMessage = "Loaded saved draft";

        if (
          localSnapshot &&
          response.status !== "Submitted" &&
          shouldPreferLocalDraft(localSnapshot.last_synced_at, response.updated_at, localSnapshot.is_dirty)
        ) {
          nextDraft = {
            ...localSnapshot.form_data,
            documents: response.form_data.documents,
          };
          nextStep = localSnapshot.current_step;
          nextDirty = localSnapshot.is_dirty;
          nextLastSyncedAt = localSnapshot.last_synced_at;
          nextMessage = localSnapshot.is_dirty
            ? "Recovered unsynced changes from this browser"
            : "Recovered a newer local snapshot";
        }

        setApplication(response);
        setProfile(savedProfile);
        setDocuments(applicationDocuments);
        setLatestPassportOcr(applicationDocuments.find((document) => document.document_type === "passport_scan")?.ocr_extraction ?? null);
        setDraft(nextDraft);
        setActiveStep(response.status === "Submitted" ? 5 : nextStep);
        setHighestStepUnlocked(response.status === "Submitted" ? 5 : Math.max(response.current_step, nextStep));
        setIsDirty(nextDirty && response.status !== "Submitted");
        setLastSyncedAt(nextLastSyncedAt);
        setSaveMessage(response.status === "Submitted" ? `Application submitted on ${formatDateTime(response.submitted_at)}` : nextMessage);
      } catch (requestError) {
        if (!cancelled) {
          handleRequestError(requestError, router, setError);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [applicationId, router, session.accessToken]);

  const validationSummary = getValidationSummary(draft);
  const isSubmitted = application?.status === "Submitted";
  const liveProgress = calculateProgress(draft);
  const progressPercentage = isSubmitted ? 100 : isDirty ? liveProgress : application?.progress_percentage ?? liveProgress;
  const currentStepErrors = validationSummary.stepErrors[activeStep];
  const visibleCurrentStepErrors = Object.entries(currentStepErrors).filter(([field]) => touchedFields[field]);
  const passportDocument = documents.find((document) => document.document_type === "passport_scan");
  const passportOcrPreview = latestPassportOcr ?? passportDocument?.ocr_extraction ?? null;
  const reviewSections = buildReviewSections(draft, documents, validationSummary.stepCompletion);

  useEffect(() => {
    if (!application || isLoading) {
      return;
    }

    writeLocalDraft(
      buildLocalDraftSnapshot(
        application,
        draft,
        activeStep,
        progressPercentage,
        isDirty,
        lastSyncedAt || application.updated_at,
      ),
    );
  }, [activeStep, application, draft, isDirty, isLoading, lastSyncedAt, progressPercentage]);

  async function persistDraft(mode: SaveMode, nextStep: number, nextDraft: ApplicationFormData): Promise<boolean> {
    if (!applicationRef.current) {
      return false;
    }

    try {
      setIsSaving(true);
      if (mode !== "autosave") {
        setError("");
      }

      const response = await saveApplicationDraft(session.accessToken, applicationId, {
        current_step: nextStep,
        form_data: nextDraft,
      });

      setApplication(response);
      setDraft(response.form_data);
      setActiveStep(response.current_step);
      setHighestStepUnlocked((current) => Math.max(current, response.current_step));
      setIsDirty(false);
      setLastSyncedAt(response.updated_at);
      setSaveMessage(resolveSaveMessage(mode, response.current_step));
      return true;
    } catch (requestError) {
      const handled = handleRequestError(requestError, router, setError);
      if (handled === "auth") {
        return false;
      }

      if (mode === "autosave") {
        setSaveMessage("Offline: changes are stored on this device");
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  persistDraftRef.current = persistDraft;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!applicationRef.current || !dirtyRef.current || savingRef.current || applicationRef.current.status === "Submitted") {
        return;
      }

      void persistDraftRef.current("autosave", stepRef.current, draftRef.current);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  function markFieldsTouched(fields: string[]) {
    setTouchedFields((current) => {
      const next = { ...current };
      for (const field of fields) {
        next[field] = true;
      }
      return next;
    });
  }

  function handleFieldBlur(fieldPath: string) {
    setTouchedFields((current) => ({
      ...current,
      [fieldPath]: true,
    }));
  }

  function handleFieldChange<TSection extends keyof ApplicationFormData, TKey extends keyof ApplicationFormData[TSection]>(
    section: TSection,
    key: TKey,
    value: ApplicationFormData[TSection][TKey],
  ) {
    if (isSubmitted) {
      return;
    }

    setDraft((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
    setIsDirty(true);
    setError("");
    setSaveMessage("Unsaved changes");
  }

  function handleStepClick(step: number) {
    if (isSubmitted && step !== 5) {
      return;
    }
    if (step > highestStepUnlocked) {
      return;
    }

    setActiveStep(step);
    setError("");
  }

  async function handleSave() {
    await persistDraft("manual", activeStep, draft);
  }

  async function handleBack() {
    const nextStep = Math.max(1, activeStep - 1);
    await persistDraft("navigation", nextStep, draft);
  }

  async function handleContinue() {
    const stepFields = getStepFieldPaths(activeStep);
    markFieldsTouched(stepFields);

    if (Object.keys(currentStepErrors).length > 0) {
      setError("Please correct the highlighted fields before continuing.");
      setSaveMessage("Validation needed before continuing");
      return;
    }

    if (activeStep === 5) {
      await persistDraft("manual", 5, draft);
      return;
    }

    const nextStep = Math.min(5, activeStep + 1);
    await persistDraft("navigation", nextStep, draft);
  }

  function handleReturnToDashboard() {
    startTransition(() => {
      router.push("/dashboard");
    });
  }

  function handleUseSavedProfile() {
    if (!profile || isSubmitted) {
      return;
    }

    setDraft((current) => ({
      ...current,
      personal: {
        ...current.personal,
        first_name: profile.first_name,
        last_name: profile.last_name,
        date_of_birth: profile.date_of_birth,
        nationality: profile.nationality,
        gender: profile.gender,
        marital_status: profile.marital_status,
        occupation: profile.occupation,
      },
      passport: {
        ...current.passport,
        passport_number: profile.passport_number,
        issuing_country: profile.issuing_country,
        issue_date: profile.issue_date,
        expiry_date: profile.expiry_date,
      },
    }));
    setIsDirty(true);
    setSaveMessage("Saved profile applied to the draft");
    setError("");
  }

  async function handleSaveProfile() {
    if (isSubmitted) {
      return;
    }

    try {
      setIsSavingProfile(true);
      setError("");
      const payload = buildProfilePayloadFromDraft(draft);
      const savedProfile = await saveProfile(session.accessToken, payload);
      setProfile(savedProfile);
      setSaveMessage("Current details saved to your profile");
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function refreshDocumentsState(nextMessage = "Documents synced just now") {
    try {
      const [applicationResponse, documentResponse] = await Promise.all([
        getApplication(session.accessToken, applicationId),
        getDocuments(session.accessToken, applicationId),
      ]);

      const latestPassportDocument = documentResponse.find((document) => document.document_type === "passport_scan");
      setApplication(applicationResponse);
      setDocuments(documentResponse);
      setLatestPassportOcr(latestPassportDocument?.ocr_extraction ?? null);
      setDraft((current) => ({
        ...current,
        documents: applicationResponse.form_data.documents,
      }));
      setLastSyncedAt(applicationResponse.updated_at);
      setSaveMessage(nextMessage);
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
    }
  }

  function handleFileSelectedForCard(cardType: DocumentType, file: File) {
    if (cardType === "applicant_photo" && file.type.startsWith("image/")) {
      const src = URL.createObjectURL(file);
      setCropperFile({ file, src });
    } else {
      void handleDocumentUpload(cardType, file);
    }
  }

  function handleCropCompleted(blob: Blob) {
    if (!cropperFile) return;
    const croppedFile = new File([blob], "applicant_photo.jpg", { type: "image/jpeg" });
    URL.revokeObjectURL(cropperFile.src);
    setCropperFile(null);
    void handleDocumentUpload("applicant_photo", croppedFile);
  }

  async function handleDocumentUpload(documentType: DocumentType, file: File) {
    if (isSubmitted) {
      return;
    }

    const queueId = `${documentType}-${Date.now()}`;
    const cardTitle = DOCUMENT_CARDS.find((c) => c.type === documentType)?.title ?? documentType;
    const origSizeFormatted = formatFileSize(file.size);

    setUploadQueue((prev) => [
      ...prev.filter((i) => i.id !== queueId),
      {
        id: queueId,
        name: file.name,
        typeLabel: cardTitle,
        progress: 25,
        stage: "compressing",
      },
    ]);

    try {
      setUploadStateByType((current) => ({
        ...current,
        [documentType]: "compressing",
      }));
      setError("");
      const prepared = await prepareDocumentUpload(documentType, file);
      setUploadNotes((current) => ({
        ...current,
        [documentType]: prepared.notes.join(" "),
      }));

      setUploadQueue((prev) =>
        prev.map((i) => (i.id === queueId ? { ...i, progress: 65, stage: "uploading" } : i))
      );

      setUploadStateByType((current) => ({
        ...current,
        [documentType]: "uploading",
      }));

      const uploadedDocument = await uploadDocument(session.accessToken, applicationId, documentType, prepared.file);
      handleFieldBlur(getDocumentFieldPath(documentType));

      if (documentType === "passport_scan") {
        setUploadQueue((prev) =>
          prev.map((i) => (i.id === queueId ? { ...i, progress: 85, stage: "ocr" } : i))
        );

        setUploadStateByType((current) => ({
          ...current,
          [documentType]: "ocr",
        }));

        const ocrResponse = await runPassportOcr(session.accessToken, {
          application_id: applicationId,
          document_id: uploadedDocument.document_id,
        });

        const nextDraft = mergeOcrIntoDraft(draftRef.current, ocrResponse);
        setLatestPassportOcr(ocrResponse);
        setDraft(nextDraft);
        setIsDirty(true);
        setTouchedFields((current) => ({
          ...current,
          "personal.first_name": true,
          "personal.last_name": true,
          "personal.date_of_birth": true,
          "personal.nationality": true,
          "passport.passport_number": true,
          "passport.issuing_country": true,
          "passport.issue_date": true,
          "passport.expiry_date": true,
        }));
        setUploadNotes((current) => ({
          ...current,
          [documentType]: [current[documentType], "Passport details were auto-filled via OCR."].filter(Boolean).join(" "),
        }));
        await persistDraft("ocr", stepRef.current, nextDraft);
        await refreshDocumentsState("Passport details auto-filled via OCR");
        return;
      } else {
        await refreshDocumentsState();
      }

      await refreshDocumentsState();
      const compSizeFormatted = formatFileSize(uploadedDocument.file_size_bytes);
      const ratio = uploadedDocument.compression_ratio ?? (file.size > uploadedDocument.file_size_bytes ? (file.size - uploadedDocument.file_size_bytes) / file.size : 0);

      setUploadQueue((prev) =>
        prev.map((i) =>
          i.id === queueId
            ? {
                ...i,
                progress: 100,
                stage: "done",
                originalSize: origSizeFormatted,
                compressedSize: compSizeFormatted,
                ratio: ratio,
              }
            : i
        )
      );
    } catch (requestError) {
      setUploadQueue((prev) =>
        prev.map((i) => (i.id === queueId ? { ...i, stage: "error", error: "Upload failed" } : i))
      );
      handleRequestError(requestError, router, setError);
    } finally {
      setUploadStateByType((current) => ({
        ...current,
        [documentType]: "idle",
      }));
    }
  }

  async function handleDocumentDelete(documentId: string) {
    if (isSubmitted) {
      return;
    }

    try {
      setError("");
      await deleteDocument(session.accessToken, documentId);
      await refreshDocumentsState();
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
    }
  }

  function handleReviewEdit(step: number) {
    setActiveStep(step);
    markFieldsTouched(getStepFieldPaths(step));
    setError("");
  }

  async function handleSubmitApplication() {
    if (isSubmitted) {
      return;
    }

    const fieldsToTouch = [1, 2, 3, 4, 5].flatMap((step) => getStepFieldPaths(step));
    markFieldsTouched(fieldsToTouch);

    if (!validationSummary.isReviewReady || !draft.review.declaration_accepted) {
      setError("Complete all required steps and accept the declaration before submission.");
      setSaveMessage("Submission is blocked until the review is complete");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      if (isDirty) {
        const didSave = await persistDraft("manual", 5, draft);
        if (!didSave) {
          return;
        }
      }

      const response = await submitApplication(session.accessToken, applicationId);
      const refreshed = await getApplication(session.accessToken, applicationId);
      setApplication(refreshed);
      setDraft(refreshed.form_data);
      setActiveStep(5);
      setHighestStepUnlocked(5);
      setIsDirty(false);
      setLastSyncedAt(response.submitted_at);
      setSaveMessage("Application sealed and submitted");
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <div className="center-state">
          <p className="subtle">Loading application draft...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="page-frame wizard-layout">
        <section className="content-panel wizard-hero-panel">
          <div className="topbar">
            <div>
              <span className="eyebrow">Modules 11 + 12</span>
              <h1 className="card-title">{application ? getCategoryLabel(application.visa_category) : "Application wizard"}</h1>
              <p className="card-copy">
                The review step now seals submitted applications, while the payment gateway remains intentionally hidden
                behind a placeholder flag for later activation.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={handleReturnToDashboard}>
              Back to dashboard
            </button>
          </div>
          {error ? <div className="banner-error">{error}</div> : null}
          <div className="wizard-status-grid">
            <div className={`status-chip status-chip-wide ${isSubmitted ? "status-chip-success" : ""}`}>
              <span className={`status-dot ${isSubmitted ? "" : "status-dot-warm"}`} />
              {application?.status ?? "Draft"}
            </div>
            <div className="status-chip status-chip-wide">
              <span className={`status-dot ${saveMessage.includes("Offline") ? "status-dot-danger" : "status-dot-warm"}`} />
              {saveMessage || buildSavedLabel(lastSyncedAt)}
            </div>
            <div className={`status-chip status-chip-wide ${validationSummary.isReviewReady ? "status-chip-success" : "status-chip-pending"}`}>
              <span className={`status-dot ${validationSummary.isReviewReady ? "" : "status-dot-warm"}`} />
              {validationSummary.isReviewReady ? "Review-ready draft" : "Still validating"}
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-meta">
              <strong>{progressPercentage}% complete</strong>
              <span className="subtle">{isSubmitted ? "Application sealed" : `Current step: ${activeStep}`}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        </section>

        <section className="wizard-steps">
          {WIZARD_STEPS.map((wizardStep) => (
            <button
              key={wizardStep.step}
              type="button"
              className={`wizard-step ${wizardStep.step === activeStep ? "is-active" : ""} ${
                validationSummary.stepCompletion[wizardStep.step] ? "is-complete" : ""
              } ${wizardStep.step <= highestStepUnlocked && (!isSubmitted || wizardStep.step === 5) ? "" : "is-disabled"}`}
              onClick={() => handleStepClick(wizardStep.step)}
              disabled={wizardStep.step > highestStepUnlocked || (isSubmitted && wizardStep.step !== 5)}
            >
              <span className="wizard-step-number">Step {wizardStep.step}</span>
              <strong>{wizardStep.title}</strong>
              <span>{wizardStep.description}</span>
            </button>
          ))}
        </section>

        <section className="content-panel">
          {(activeStep === 1 || activeStep === 2) && (
            <div className="mb-6 rounded-2xl border border-blue-200/80 bg-linear-to-r from-blue-50/90 via-indigo-50/50 to-white p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2A6F]">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    {profile
                      ? `Saved Applicant Profile: ${profile.first_name} ${profile.last_name} (${profile.nationality || "Verified"})`
                      : "No Saved Profile Found"}
                  </div>
                  <p className="text-xs text-slate-500">
                    {profile
                      ? "Auto-fill personal and passport fields instantly from your PostgreSQL profile."
                      : "Fill in the fields below and save as your persistent profile for one-click re-use."}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {profile && (
                    <button
                      type="button"
                      onClick={handleUseSavedProfile}
                      disabled={isSubmitted}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B2A6F] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#081E4F] disabled:opacity-50"
                    >
                      <span>✨ Use Profile Data</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || isSubmitted}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <span>{isSavingProfile ? "Saving..." : "Save Details to Profile"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeStep === 1 ? (
            <div className="form-grid two-col">
              <Field path="personal.first_name" label="First Name" value={draft.personal.first_name} error={getVisibleFieldError("personal.first_name", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "first_name", value)} />
              <Field path="personal.last_name" label="Last Name" value={draft.personal.last_name} error={getVisibleFieldError("personal.last_name", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "last_name", value)} />
              <Field path="personal.date_of_birth" label="Date of Birth" type="date" value={draft.personal.date_of_birth} error={getVisibleFieldError("personal.date_of_birth", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "date_of_birth", value)} />
              <Field path="personal.nationality" label="Nationality" value={draft.personal.nationality} error={getVisibleFieldError("personal.nationality", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "nationality", value)} />
              <Field path="personal.gender" label="Gender" value={draft.personal.gender} error={getVisibleFieldError("personal.gender", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "gender", value)} />
              <Field path="personal.marital_status" label="Marital Status" value={draft.personal.marital_status} error={getVisibleFieldError("personal.marital_status", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "marital_status", value)} />
              <Field path="personal.occupation" label="Occupation" value={draft.personal.occupation} error={getVisibleFieldError("personal.occupation", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("personal", "occupation", value)} />
            </div>
          ) : null}

          {activeStep === 2 ? (
            <div className="review-grid">
              {passportOcrPreview ? (
                <div className="helper-box">
                  <strong>Auto-filled via OCR</strong>
                  Passport details were prefilled from the uploaded passport scan with{" "}
                  {Math.round(passportOcrPreview.confidence_score * 100)}% confidence. You can edit any field below.
                </div>
              ) : null}
              <div className="form-grid two-col">
                <Field path="passport.passport_number" label="Passport Number" value={draft.passport.passport_number} error={getVisibleFieldError("passport.passport_number", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("passport", "passport_number", value.toUpperCase())} />
                <Field path="passport.issuing_country" label="Issuing Country" value={draft.passport.issuing_country} error={getVisibleFieldError("passport.issuing_country", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("passport", "issuing_country", value)} />
                <Field path="passport.issue_date" label="Issue Date" type="date" value={draft.passport.issue_date} error={getVisibleFieldError("passport.issue_date", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("passport", "issue_date", value)} />
                <Field path="passport.expiry_date" label="Expiry Date" type="date" value={draft.passport.expiry_date} error={getVisibleFieldError("passport.expiry_date", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("passport", "expiry_date", value)} />
              </div>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className="form-grid two-col">
              <Field path="travel.intended_arrival_date" label="Intended Arrival Date" type="date" value={draft.travel.intended_arrival_date} error={getVisibleFieldError("travel.intended_arrival_date", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("travel", "intended_arrival_date", value)} />
              <Field path="travel.port_of_entry" label="Port of Entry" value={draft.travel.port_of_entry} error={getVisibleFieldError("travel.port_of_entry", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("travel", "port_of_entry", value)} />
              <Field path="travel.stay_duration_days" label="Stay Duration in Days" type="number" value={draft.travel.stay_duration_days} error={getVisibleFieldError("travel.stay_duration_days", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("travel", "stay_duration_days", value)} />
              <Field path="travel.accommodation_address" label="Accommodation Address" value={draft.travel.accommodation_address} error={getVisibleFieldError("travel.accommodation_address", touchedFields, validationSummary.stepErrors)} disabled={isSubmitted} onBlur={handleFieldBlur} onChange={(value) => handleFieldChange("travel", "accommodation_address", value)} />
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className="space-y-6">
              <UploadQueue items={uploadQueue} />
              <div className="document-card-grid">
                {DOCUMENT_CARDS.map((card) => {
                  const existingDocument = documents.find((document) => document.document_type === card.type);
                  return (
                    <DocumentUploadCard
                      key={card.type}
                      documentType={card.type}
                      path={getDocumentFieldPath(card.type)}
                      title={card.title}
                      description={card.description}
                      accept={card.accept}
                      document={existingDocument}
                      error={getVisibleFieldError(getDocumentFieldPath(card.type), touchedFields, validationSummary.stepErrors)}
                      note={uploadNotes[card.type]}
                      uploadState={uploadStateByType[card.type]}
                      isLocked={isSubmitted}
                      onBlur={handleFieldBlur}
                      onDelete={existingDocument ? () => handleDocumentDelete(existingDocument.document_id) : undefined}
                      onFileSelected={(file) => handleFileSelectedForCard(card.type, file)}
                    />
                  );
                })}
                {passportOcrPreview ? <OcrPreviewCard extraction={passportOcrPreview} /> : null}
              </div>
            </div>
          ) : null}

          {activeStep === 5 ? (
            <ReviewSubmissionPanel
              sections={reviewSections}
              isReviewReady={validationSummary.isReviewReady}
              declarationAccepted={draft.review.declaration_accepted}
              declarationError={getVisibleFieldError("review.declaration_accepted", touchedFields, validationSummary.stepErrors)}
              readinessError={getVisibleFieldError("review.readiness", touchedFields, validationSummary.stepErrors)}
              isSubmitting={isSubmitting}
              isSubmitted={isSubmitted}
              submittedAt={application?.submitted_at}
              applicationId={applicationId}
              accessToken={session.accessToken}
              feeAmount={application?.visa_category === "tourist_multi_entry" ? 85 : application?.visa_category === "business_expedited" ? 120 : 50}
              onEditStep={handleReviewEdit}
              onDeclarationBlur={() => handleFieldBlur("review.declaration_accepted")}
              onDeclarationChange={(nextValue) => handleFieldChange("review", "declaration_accepted", nextValue)}
              onSubmit={() => void handleSubmitApplication()}
            />
          ) : null}

          {visibleCurrentStepErrors.length > 0 ? (
            <div className="validation-summary">
              <strong>Still needs attention</strong>
              <ul className="bulletless compact">
                {visibleCurrentStepErrors.map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="wizard-actions">
            <button className="secondary-button" type="button" onClick={handleSave} disabled={isSaving || isSubmitted}>
              {isSaving ? "Saving..." : "Save draft"}
            </button>
            <div className="wizard-actions-right">
              <button className="secondary-button" type="button" onClick={handleBack} disabled={isSaving || isSubmitted || activeStep === 1}>
                Back
              </button>
              {!isSubmitted ? (
                <button className="primary-button inline" type="button" onClick={handleContinue} disabled={isSaving}>
                  {activeStep === 5 ? "Save review state" : "Save and continue"}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      {cropperFile ? (
        <PassportPhotoCropper
          imageSrc={cropperFile.src}
          onCropComplete={handleCropCompleted}
          onCancel={() => {
            URL.revokeObjectURL(cropperFile.src);
            setCropperFile(null);
          }}
        />
      ) : null}
      <VisaAssistantWidget accessToken={session.accessToken} applicationId={applicationId} currentStep={activeStep} />
    </main>
  );
}


function Field({
  path,
  label,
  value,
  error,
  disabled = false,
  onBlur,
  onChange,
  type = "text",
}: Readonly<{
  path: string;
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onBlur: (fieldPath: string) => void;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
}>) {
  const isValid = Boolean(!error && value && value.trim().length > 0);

  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <input
        className="text-input"
        data-invalid={Boolean(error)}
        type={type}
        value={value}
        disabled={disabled}
        onBlur={() => onBlur(path)}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="field-label">{label}</span>
        {isValid && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <Check className="h-3 w-3" /> Valid
          </span>
        )}
      </div>
      <div className="relative">
        <input
          className={`text-input ${isValid ? "border-emerald-400 focus:border-emerald-600" : ""}`}
          data-invalid={Boolean(error)}
          type={type}
          value={value}
          disabled={disabled}
          onBlur={() => onBlur(path)}
          onChange={(event) => {
            let val = event.target.value;
            if (path === "passport.passport_number") {
              val = sanitizePassportNumber(val);
            }
            onChange(val);
          }}
        />
        {isValid ? (
          <Check className="pointer-events-none absolute top-3 right-3 h-4 w-4 text-emerald-500" />
        ) : null}
      </div>
      {error ? <span className="error-text">{error}</span> : null}
    </label>
  );
}


function DocumentUploadCard({
  path,
  documentType,
  title,
  description,
  accept,
  document,
  error,
  note,
  uploadState,
  isLocked,
  onBlur,
  onFileSelected,
  onDelete,
}: Readonly<{
  path: string;
  documentType: DocumentType;
  title: string;
  description: string;
  accept: string;
  document?: ApplicationDocument;
  error?: string;
  note?: string;
  uploadState: UploadState;
  isLocked: boolean;
  onBlur: (fieldPath: string) => void;
  onFileSelected: (file: File) => void;
  onDelete?: () => void;
}>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    onBlur(path);
    onFileSelected(file);
  }

  return (
    <div
      className={`document-upload-card ${isDragging ? "is-dragging" : ""} ${document ? "is-uploaded" : ""} ${isLocked ? "is-locked" : ""}`}
      onDragOver={(event) => {
        if (isLocked) {
          return;
        }
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        if (isLocked) {
          return;
        }
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="document-upload-top">
        <div>
          <strong>{title}</strong>
          <p className="card-copy small">{description}</p>
        </div>
        <span className="status-chip compact-chip">
          <span className={`status-dot ${uploadState === "idle" && document ? "" : "status-dot-warm"}`} />
          {getUploadStateLabel(uploadState, Boolean(document), isLocked)}
        </span>
      </div>

      <div className="document-upload-body">
        {document ? (
          <div className="space-y-2">
            <div className="document-meta">
              <span>{document.file_name}</span>
              <span className="subtle">{formatFileSize(document.file_size_bytes)}</span>
              <a className="subtle linkish" href={document.public_url} target="_blank" rel="noreferrer">
                Open uploaded file
              </a>
            </div>
            <DocumentValidationBadge
              documentType={documentType}
              fileSizeBytes={document.file_size_bytes}
              fileName={document.file_name}
              isCompressed={Boolean(document.compression_ratio && document.compression_ratio > 0)}
              compressionRatio={document.compression_ratio}
            />
          </div>
        ) : (
          <p className="subtle">Drag and drop a file here or choose one from your device.</p>
        )}
        {note ? <span className="subtle">{note}</span> : null}
        {error ? <span className="error-text">{error}</span> : null}
      </div>


      <div className="document-actions">
        <input ref={inputRef} className="visually-hidden" type="file" accept={accept} onChange={(event) => handleFiles(event.target.files)} />
        <button className="secondary-button inline" type="button" disabled={uploadState !== "idle" || isLocked} onClick={() => inputRef.current?.click()}>
          {document ? "Replace file" : "Choose file"}
        </button>
        {document && onDelete ? (
          <button className="secondary-button inline danger-button" type="button" onClick={onDelete} disabled={isLocked}>
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

function OcrPreviewCard({
  extraction,
}: Readonly<{
  extraction: PassportOcrPreview;
}>) {
  const fields = extraction.extracted_fields;

  return (
    <article className="ocr-preview-card">
      <div className="document-upload-top">
        <div>
          <strong>Passport OCR preview</strong>
          <p className="card-copy small">
            Auto-filled via simulated OCR with {Math.round(extraction.confidence_score * 100)}% confidence.
          </p>
        </div>
        <span className="status-chip compact-chip">
          <span className="status-dot" />
          OCR ready
        </span>
      </div>
      <div className="ocr-field-grid">
        <span>{`${fields.first_name || "Applicant"} ${fields.last_name}`.trim()}</span>
        <span>{fields.passport_number || "Passport number pending"}</span>
        <span>{fields.nationality || "Nationality pending"}</span>
        <span>{fields.expiry_date || "Expiry date pending"}</span>
      </div>
      <ul className="bulletless compact">
        {extraction.advisory_notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}

function getVisibleFieldError(
  fieldPath: string,
  touchedFields: Record<string, boolean>,
  stepErrors: Record<number, Record<string, string>>,
): string | undefined {
  if (!touchedFields[fieldPath]) {
    return undefined;
  }

  for (const step of Object.keys(stepErrors)) {
    const match = stepErrors[Number(step)][fieldPath];
    if (match) {
      return match;
    }
  }

  return undefined;
}

function shouldPreferLocalDraft(localTimestamp: string, backendTimestamp: string, isDirty: boolean): boolean {
  if (isDirty) {
    return true;
  }

  return new Date(localTimestamp).getTime() > new Date(backendTimestamp).getTime();
}

function buildSavedLabel(lastSyncedAt: string): string {
  if (!lastSyncedAt) {
    return "Ready to edit";
  }

  return `Last synced ${formatDateTime(lastSyncedAt)}`;
}

function resolveSaveMessage(mode: SaveMode, currentStep: number): string {
  switch (mode) {
    case "autosave":
      return "Saved just now";
    case "ocr":
      return "Passport details auto-filled via OCR";
    default:
      return `Saved step ${currentStep} just now`;
  }
}

function handleRequestError(
  requestError: unknown,
  router: ReturnType<typeof useRouter>,
  setError: (value: string) => void,
): "auth" | "handled" {
  const message = requestError instanceof Error ? requestError.message : "Something went wrong.";

  if (message.toLowerCase().includes("authentication")) {
    clearSession();
    router.replace("/login");
    return "auth";
  }

  setError(message);
  return "handled";
}

function buildProfilePayloadFromDraft(draft: ApplicationFormData): ProfilePayload {
  return {
    first_name: draft.personal.first_name,
    last_name: draft.personal.last_name,
    date_of_birth: draft.personal.date_of_birth,
    nationality: draft.personal.nationality,
    gender: draft.personal.gender,
    marital_status: draft.personal.marital_status,
    occupation: draft.personal.occupation,
    passport_number: draft.passport.passport_number,
    issuing_country: draft.passport.issuing_country,
    issue_date: draft.passport.issue_date,
    expiry_date: draft.passport.expiry_date,
  };
}

function mergeOcrIntoDraft(currentDraft: ApplicationFormData, extraction: PassportOcrResponse): ApplicationFormData {
  const { extracted_fields: extractedFields } = extraction;

  return {
    ...currentDraft,
    personal: {
      ...currentDraft.personal,
      first_name: extractedFields.first_name || currentDraft.personal.first_name,
      last_name: extractedFields.last_name || currentDraft.personal.last_name,
      date_of_birth: extractedFields.date_of_birth || currentDraft.personal.date_of_birth,
      nationality: extractedFields.nationality || currentDraft.personal.nationality,
    },
    passport: {
      ...currentDraft.passport,
      passport_number: extractedFields.passport_number || currentDraft.passport.passport_number,
      issuing_country: extractedFields.issuing_country || currentDraft.passport.issuing_country,
      issue_date: extractedFields.issue_date || currentDraft.passport.issue_date,
      expiry_date: extractedFields.expiry_date || currentDraft.passport.expiry_date,
    },
  };
}

function buildReviewSections(
  draft: ApplicationFormData,
  documents: ApplicationDocument[],
  stepCompletion: Record<number, boolean>,
): ReviewSection[] {
  return [
    {
      step: 1,
      title: "Personal details",
      description: "Identity and applicant profile",
      isComplete: stepCompletion[1],
      items: [
        { label: "Full name", value: `${draft.personal.first_name} ${draft.personal.last_name}`.trim() || "Not filled yet" },
        { label: "Date of birth", value: draft.personal.date_of_birth || "Pending" },
        { label: "Nationality", value: draft.personal.nationality || "Pending" },
        { label: "Occupation", value: draft.personal.occupation || "Pending" },
      ],
    },
    {
      step: 2,
      title: "Passport",
      description: "Passport identity and validity",
      isComplete: stepCompletion[2],
      items: [
        { label: "Passport number", value: draft.passport.passport_number || "Pending" },
        { label: "Issuing country", value: draft.passport.issuing_country || "Pending" },
        { label: "Issue date", value: draft.passport.issue_date || "Pending" },
        { label: "Expiry date", value: draft.passport.expiry_date || "Pending" },
      ],
    },
    {
      step: 3,
      title: "Travel plan",
      description: "Arrival, stay, and accommodation",
      isComplete: stepCompletion[3],
      items: [
        { label: "Arrival date", value: draft.travel.intended_arrival_date || "Pending" },
        { label: "Port of entry", value: draft.travel.port_of_entry || "Pending" },
        { label: "Stay duration", value: draft.travel.stay_duration_days ? `${draft.travel.stay_duration_days} days` : "Pending" },
        { label: "Accommodation", value: draft.travel.accommodation_address || "Pending" },
      ],
    },
    {
      step: 4,
      title: "Documents",
      description: "Uploaded files and readiness checks",
      isComplete: stepCompletion[4],
      items: DOCUMENT_CARDS.map((card) => {
        const document = documents.find((item) => item.document_type === card.type);
        return {
          label: card.title,
          value: document ? `${document.file_name} | ${formatFileSize(document.file_size_bytes)}` : "Pending",
        };
      }),
    },
  ];
}

function getDocumentFieldPath(documentType: DocumentType): string {
  switch (documentType) {
    case "passport_scan":
      return "documents.passport_scan_ready";
    case "applicant_photo":
      return "documents.applicant_photo_ready";
    case "flight_itinerary":
      return "documents.flight_itinerary_ready";
    case "hotel_booking":
      return "documents.hotel_booking_ready";
  }
}

function getUploadStateLabel(uploadState: UploadState, hasDocument: boolean, isLocked: boolean): string {
  if (isLocked) {
    return hasDocument ? "Locked" : "Sealed";
  }

  switch (uploadState) {
    case "compressing":
      return "Compressing";
    case "uploading":
      return "Uploading";
    case "ocr":
      return "Reading passport";
    default:
      return hasDocument ? "Uploaded" : "Required";
  }
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
