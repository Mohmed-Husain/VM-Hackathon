import { ApplicationWizardShell } from "@/components/wizard/application-wizard-shell";

export default async function ApplicationPage({
  params,
}: Readonly<{
  params: Promise<{ applicationId: string }>;
}>) {
  const { applicationId } = await params;

  return <ApplicationWizardShell applicationId={applicationId} />;
}
