import { requireAdmin } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminAppointmentsPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Appointments"
        description="All appointments across the clinic with filters by doctor and status."
      />
      <EmptyState
        title="Appointments overview is coming soon"
        description="A filterable table of booked and cancelled appointments will live here."
      />
    </>
  );
}
