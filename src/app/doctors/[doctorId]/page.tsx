import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = await params;

  return (
    <>
      <PageHeader
        eyebrow="Doctors"
        title={`Doctor profile #${doctorId}`}
        description="This page will show the doctor's details and their available time slots for the next two weeks."
      />
      <EmptyState
        title="Doctor profile is coming soon"
        description="Available time slots, grouped by day, will appear here."
      />
    </>
  );
}
