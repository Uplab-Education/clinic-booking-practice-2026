import { requireAdmin } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminDoctorsPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Doctors"
        description="Manage the clinic's doctors: add new ones, update details, and deactivate doctors who no longer accept patients."
      />
      <EmptyState
        title="Doctors management is coming soon"
        description="A table of all doctors with create, edit, and deactivate actions will live here."
      />
    </>
  );
}
