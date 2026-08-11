import { requireAdmin } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminSchedulesPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Schedules"
        description="Set each doctor's weekly working hours and appointment slot length."
      />
      <EmptyState
        title="Schedule management is coming soon"
        description="A weekly schedule editor per doctor will live here."
      />
    </>
  );
}
