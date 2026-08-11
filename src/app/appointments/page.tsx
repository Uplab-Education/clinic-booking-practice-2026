import { requireUser } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AppointmentsPage() {
  await requireUser();

  return (
    <>
      <PageHeader
        eyebrow="Appointments"
        title="My appointments"
        description="Review your upcoming visits, see past and cancelled ones, and cancel a booking when plans change."
      />
      <EmptyState
        title="No appointments view yet"
        description="Your booked, past, and cancelled appointments will be listed here."
      />
    </>
  );
}
