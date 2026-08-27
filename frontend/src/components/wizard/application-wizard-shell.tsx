"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { VisaAssistantWidget } from "@/components/assistant/visa-assistant-widget";
import { ProtectedPage } from "@/components/auth/protected-page";
import {
  WIZARD_STEPS,
  calculateProgress,
  createEmptyFormData,
  getCategoryLabel,
  getStepFieldPaths,
  getValidationSummary,
} from "@/lib/application";
import {
  deleteDocument,
  getApplication,
  getDocuments,
  getProfile,
  runPassportOcr,
  saveApplicationDraft,
  saveProfile,
  uploadDocument,
} from "@/lib/api";
import { buildLocalDraftSnapshot, readLocalDraft, writeLocalDraft } from "@/lib/draft-storage";
import { prepareDocumentUpload } from "@/lib/image-processing";
import { clearSession } from "@/lib/session";
import type { StoredSession } from "@/types/auth";
import type { ApplicationDocument, DocumentType, PassportOcrExtraction, PassportOcrResponse } from "@/types/document";
import type { ApplicantProfile, ProfilePayload } from "@/types/profile";
import type { ApplicationDetail, ApplicationFormData } from "@/types/application";

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

  const draftRef = useRef(draft);
  const stepRef = useRef(activeStep);
  const savingRef = useRef(isSaving);
  const dirtyRef = useRef(isDirty);
  const applicationRef = useRef(application);
  const persistDraftRef = useRef<(mode: SaveMode, nextStep: number, nextDraft: ApplicationFormData) => Promise<void>>(
    async () => {},
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

        if (localSnapshot && shouldPreferLocalDraft(localSnapshot.last_synced_at, response.updated_at, localSnapshot.is_dirty)) {
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
        setActiveStep(nextStep);
        setHighestStepUnlocked(Math.max(response.current_step, nextStep));
        setIsDirty(nextDirty);
        setLastSyncedAt(nextLastSyncedAt);
        setSaveMessage(nextMessage);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        handleRequestError(requestError, router, setError);
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
  const liveProgress = calculateProgress(draft);
  const progressPercentage = isDirty ? liveProgress : application?.progress_percentage ?? liveProgress;
  const currentStepErrors = validationSummary.stepErrors[activeStep];
  const visibleCurrentStepErrors = Object.entries(currentStepErrors).filter(([field]) => touchedFields[field]);
  const passportDocument = documents.find((document) => document.document_type === "passport_scan");
  const passportOcrPreview = latestPassportOcr ?? passportDocument?.ocr_extraction ?? null;

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

  async function persistDraft(mode: SaveMode, nextStep: number, nextDraft: ApplicationFormData) {
    if (!applicationRef.current) {
      return;
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
    } catch (requestError) {
      const handled = handleRequestError(requestError, router, setError);
      if (handled === "auth") {
        return;
      }

      if (mode === "autosave") {
        setSaveMessage("Offline: changes are stored on this device");
      }
    } finally {
      setIsSaving(false);
    }
  }

  persistDraftRef.current = persistDraft;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!applicationRef.current || !dirtyRef.current || savingRef.current) {
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

  function handleFieldChange<
    TSection extends keyof ApplicationFormData,
    TKey extends keyof ApplicationFormData[TSection]
  >(section: TSection, key: TKey, value: ApplicationFormData[TSection][TKey]) {
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

    const nextStep = Math.min(5, activeStep + 1);
    await persistDraft("navigation", nextStep, draft);
  }

  function handleReturnToDashboard() {
    startTransition(() => {
      router.push("/dashboard");
    });
  }

  function handleUseSavedProfile() {
    if (!profile) {
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

  async function handleDocumentUpload(documentType: DocumentType, file: File) {
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

      setUploadStateByType((current) => ({
        ...current,
        [documentType]: "uploading",
      }));

      const uploadedDocument = await uploadDocument(session.accessToken, applicationId, documentType, prepared.file);
      handleFieldBlur(getDocumentFieldPath(documentType));

      if (documentType === "passport_scan") {
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
          [documentType]: [current[documentType], "Passport details were auto-filled via OCR."]
            .filter(Boolean)
            .join(" "),
        }));
        await persistDraft("ocr", stepRef.current, nextDraft);
        await refreshDocumentsState("Passport details auto-filled via OCR");
        return;
      }

      await refreshDocumentsState();
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
    } finally {
      setUploadStateByType((current) => ({
        ...current,
        [documentType]: "idle",
      }));
    }
  }

  async function handleDocumentDelete(documentId: string) {
    try {
      setError("");
      await deleteDocument(session.accessToken, documentId);
      await refreshDocumentsState();
    } catch (requestError) {
      handleRequestError(requestError, router, setError);
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
        <section className="content-panel">
          <div className="topbar">
            <div>
              <span className="eyebrow">Module 9 + 10</span>
              <h1 className="card-title">{application ? getCategoryLabel(application.visa_category) : "Application wizard"}</h1>
              <p className="card-copy">
                The wizard now compresses image uploads on the client, simulates passport OCR for faster data entry,
                and adds grounded visa guidance beside the existing autosave and validation flow.
              </p>
            </div>
            <button className="secondary-button" type="button" onClick={handleReturnToDashboard}>
              Back to dashboard
            </button>
          </div>
          {error ? <div className="banner-error">{error}</div> : null}
          <div className="wizard-summary-row">
            <div className="status-chip">
              <span className="status-dot" />
              {application?.status ?? "Draft"}
            </div>
            <div className="status-chip">
              <span className={`status-dot ${saveMessage.includes("Offline") ? "status-dot-danger" : "status-dot-warm"}`} />
              {saveMessage || buildSavedLabel(lastSyncedAt)}
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-meta">
              <strong>{progressPercentage}% complete</strong>
              <span className="subtle">Current step: {activeStep}</span>
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
              } ${wizardStep.step <= highestStepUnlocked ? "" : "is-disabled"}`}
              onClick={() => handleStepClick(wizardStep.step)}
              disabled={wizardStep.step > highestStepUnlocked}
            >
              <span className="wizard-step-number">Step {wizardStep.step}</span>
              <strong>{wizardStep.title}</strong>
              <span>{wizardStep.description}</span>
            </button>
          ))}
        </section>

        <section className="content-panel">
          {(activeStep === 1 || activeStep === 2) && (
            <div className="action-strip">
              <button className="secondary-button inline" type="button" onClick={handleUseSavedProfile} disabled={!profile}>
                {profile ? "Use my saved profile data" : "No saved profile yet"}
              </button>
              <button className="secondary-button inline" type="button" onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "Saving profile..." : "Save current details as profile"}
              </button>
            </div>
          )}

          {activeStep === 1 ? (
            <div className="form-grid two-col">
              <Field
                path="personal.first_name"
                label="First Name"
                value={draft.personal.first_name}
                error={getVisibleFieldError("personal.first_name", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "first_name", value)}
              />
              <Field
                path="personal.last_name"
                label="Last Name"
                value={draft.personal.last_name}
                error={getVisibleFieldError("personal.last_name", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "last_name", value)}
              />
              <Field
                path="personal.date_of_birth"
                label="Date of Birth"
                type="date"
                value={draft.personal.date_of_birth}
                error={getVisibleFieldError("personal.date_of_birth", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "date_of_birth", value)}
              />
              <Field
                path="personal.nationality"
                label="Nationality"
                value={draft.personal.nationality}
                error={getVisibleFieldError("personal.nationality", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "nationality", value)}
              />
              <Field
                path="personal.gender"
                label="Gender"
                value={draft.personal.gender}
                error={getVisibleFieldError("personal.gender", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "gender", value)}
              />
              <Field
                path="personal.marital_status"
                label="Marital Status"
                value={draft.personal.marital_status}
                error={getVisibleFieldError("personal.marital_status", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "marital_status", value)}
              />
              <Field
                path="personal.occupation"
                label="Occupation"
                value={draft.personal.occupation}
                error={getVisibleFieldError("personal.occupation", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("personal", "occupation", value)}
              />
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
                <Field
                  path="passport.passport_number"
                  label="Passport Number"
                  value={draft.passport.passport_number}
                  error={getVisibleFieldError("passport.passport_number", touchedFields, validationSummary.stepErrors)}
                  onBlur={handleFieldBlur}
                  onChange={(value) => handleFieldChange("passport", "passport_number", value.toUpperCase())}
                />
                <Field
                  path="passport.issuing_country"
                  label="Issuing Country"
                  value={draft.passport.issuing_country}
                  error={getVisibleFieldError("passport.issuing_country", touchedFields, validationSummary.stepErrors)}
                  onBlur={handleFieldBlur}
                  onChange={(value) => handleFieldChange("passport", "issuing_country", value)}
                />
                <Field
                  path="passport.issue_date"
                  label="Issue Date"
                  type="date"
                  value={draft.passport.issue_date}
                  error={getVisibleFieldError("passport.issue_date", touchedFields, validationSummary.stepErrors)}
                  onBlur={handleFieldBlur}
                  onChange={(value) => handleFieldChange("passport", "issue_date", value)}
                />
                <Field
                  path="passport.expiry_date"
                  label="Expiry Date"
                  type="date"
                  value={draft.passport.expiry_date}
                  error={getVisibleFieldError("passport.expiry_date", touchedFields, validationSummary.stepErrors)}
                  onBlur={handleFieldBlur}
                  onChange={(value) => handleFieldChange("passport", "expiry_date", value)}
                />
              </div>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className="form-grid two-col">
              <Field
                path="travel.intended_arrival_date"
                label="Intended Arrival Date"
                type="date"
                value={draft.travel.intended_arrival_date}
                error={getVisibleFieldError("travel.intended_arrival_date", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("travel", "intended_arrival_date", value)}
              />
              <Field
                path="travel.port_of_entry"
                label="Port of Entry"
                value={draft.travel.port_of_entry}
                error={getVisibleFieldError("travel.port_of_entry", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("travel", "port_of_entry", value)}
              />
              <Field
                path="travel.stay_duration_days"
                label="Stay Duration in Days"
                type="number"
                value={draft.travel.stay_duration_days}
                error={getVisibleFieldError("travel.stay_duration_days", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("travel", "stay_duration_days", value)}
              />
              <Field
                path="travel.accommodation_address"
                label="Accommodation Address"
                value={draft.travel.accommodation_address}
                error={getVisibleFieldError("travel.accommodation_address", touchedFields, validationSummary.stepErrors)}
                onBlur={handleFieldBlur}
                onChange={(value) => handleFieldChange("travel", "accommodation_address", value)}
              />
            </div>
          ) : null}

          {activeStep === 4 ? (
            <div className="document-card-grid">
              {DOCUMENT_CARDS.map((card) => {
                const existingDocument = documents.find((document) => document.document_type === card.type);
                return (
                  <DocumentUploadCard
                    key={card.type}
                    path={getDocumentFieldPath(card.type)}
                    title={card.title}
                    description={card.description}
                    accept={card.accept}
                    document={existingDocument}
                    error={getVisibleFieldError(getDocumentFieldPath(card.type), touchedFields, validationSummary.stepErrors)}
                    note={uploadNotes[card.type]}
                    uploadState={uploadStateByType[card.type]}
                    onBlur={handleFieldBlur}
                    onDelete={existingDocument ? () => handleDocumentDelete(existingDocument.document_id) : undefined}
                    onFileSelected={(file) => void handleDocumentUpload(card.type, file)}
                  />
                );
              })}
              {passportOcrPreview ? <OcrPreviewCard extraction={passportOcrPreview} /> : null}
            </div>
          ) : null}

          {activeStep === 5 ? (
            <div className="review-grid">
              <ReviewBlock
                title="Personal Details"
                content={[
                  `${draft.personal.first_name} ${draft.personal.last_name}`.trim() || "Not filled yet",
                  draft.personal.date_of_birth || "Date of birth pending",
                  draft.personal.nationality || "Nationality pending",
                  draft.personal.occupation || "Occupation pending",
                ]}
              />
              <ReviewBlock
                title="Passport"
                content={[
                  draft.passport.passport_number || "Passport number pending",
                  draft.passport.issuing_country || "Issuing country pending",
                  draft.passport.expiry_date || "Expiry date pending",
                ]}
              />
              <ReviewBlock
                title="Travel"
                content={[
                  draft.travel.intended_arrival_date || "Arrival date pending",
                  draft.travel.port_of_entry || "Port of entry pending",
                  draft.travel.accommodation_address || "Accommodation pending",
                ]}
              />
              <ReviewBlock
                title="Documents"
                content={DOCUMENT_CARDS.map((card) => {
                  const document = documents.find((item) => item.document_type === card.type);
                  return document ? `${card.title}: ${document.file_name}` : `${card.title}: pending`;
                })}
              />
              <label className="check-panel">
                <input
                  type="checkbox"
                  checked={draft.review.declaration_accepted}
                  onBlur={() => handleFieldBlur("review.declaration_accepted")}
                  onChange={(event) => handleFieldChange("review", "declaration_accepted", event.target.checked)}
                />
                <span>
                  I hereby declare that the information entered in this MVP application draft is accurate to the best
                  of my knowledge.
                </span>
              </label>
              {getVisibleFieldError("review.declaration_accepted", touchedFields, validationSummary.stepErrors) ? (
                <span className="error-text">
                  {getVisibleFieldError("review.declaration_accepted", touchedFields, validationSummary.stepErrors)}
                </span>
              ) : null}
              {getVisibleFieldError("review.readiness", touchedFields, validationSummary.stepErrors) ? (
                <span className="error-text">
                  {getVisibleFieldError("review.readiness", touchedFields, validationSummary.stepErrors)}
                </span>
              ) : null}
              <div className="helper-box">
                <strong>Payment is intentionally hidden</strong>
                The payment section is reserved for a later module and stays out of the visible applicant flow for now.
              </div>
            </div>
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
            <button className="secondary-button" type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save draft"}
            </button>
            <div className="wizard-actions-right">
              <button
                className="secondary-button"
                type="button"
                onClick={handleBack}
                disabled={isSaving || activeStep === 1}
              >
                Back
              </button>
              <button className="primary-button inline" type="button" onClick={handleContinue} disabled={isSaving}>
                {activeStep === 5 ? "Validate and save review" : "Save and continue"}
              </button>
            </div>
          </div>
        </section>
      </div>
      <VisaAssistantWidget accessToken={session.accessToken} applicationId={applicationId} currentStep={activeStep} />
    </main>
  );
}

function Field({
  path,
  label,
  value,
  error,
  onBlur,
  onChange,
  type = "text",
}: Readonly<{
  path: string;
  label: string;
  value: string;
  error?: string;
  onBlur: (fieldPath: string) => void;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
}>) {
  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <input
        className="text-input"
        data-invalid={Boolean(error)}
        type={type}
        value={value}
        onBlur={() => onBlur(path)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="error-text">{error}</span> : null}
    </label>
  );
}

function DocumentUploadCard({
  path,
  title,
  description,
  accept,
  document,
  error,
  note,
  uploadState,
  onBlur,
  onFileSelected,
  onDelete,
}: Readonly<{
  path: string;
  title: string;
  description: string;
  accept: string;
  document?: ApplicationDocument;
  error?: string;
  note?: string;
  uploadState: UploadState;
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
      className={`document-upload-card ${isDragging ? "is-dragging" : ""} ${document ? "is-uploaded" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
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
          {getUploadStateLabel(uploadState, Boolean(document))}
        </span>
      </div>

      <div className="document-upload-body">
        {document ? (
          <div className="document-meta">
            <span>{document.file_name}</span>
            <span className="subtle">{formatFileSize(document.file_size_bytes)}</span>
            <a className="subtle linkish" href={document.public_url} target="_blank" rel="noreferrer">
              Open uploaded file
            </a>
          </div>
        ) : (
          <p className="subtle">Drag and drop a file here or choose one from your device.</p>
        )}
        {note ? <span className="subtle">{note}</span> : null}
        {error ? <span className="error-text">{error}</span> : null}
      </div>

      <div className="document-actions">
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept={accept}
          onChange={(event) => handleFiles(event.target.files)}
        />
        <button
          className="secondary-button inline"
          type="button"
          disabled={uploadState !== "idle"}
          onClick={() => inputRef.current?.click()}
        >
          {document ? "Replace file" : "Choose file"}
        </button>
        {document && onDelete ? (
          <button className="secondary-button inline danger-button" type="button" onClick={onDelete}>
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
  extraction: PassportOcrExtraction | PassportOcrResponse;
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
        <span>{fields.first_name || "Applicant"} {fields.last_name}</span>
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

function ReviewBlock({ title, content }: Readonly<{ title: string; content: string[] }>) {
  return (
    <article className="review-block">
      <strong>{title}</strong>
      <ul className="bulletless compact">
        {content.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
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

  return `Last synced ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastSyncedAt))}`;
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

function mergeOcrIntoDraft(
  currentDraft: ApplicationFormData,
  extraction: PassportOcrResponse,
): ApplicationFormData {
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

function getUploadStateLabel(uploadState: UploadState, hasDocument: boolean): string {
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
