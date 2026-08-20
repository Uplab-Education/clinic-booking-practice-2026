import { requireAdmin } from "@/auth/guards";
import { DoctorForm } from "@/components/admin/DoctorForm";
import { PageHeader } from "@/components/ui/page-header";
import { listSpecialties } from "@/db/queries/doctors";

export default async function CreateDoctorPage() {
  await requireAdmin();

  const specialties = await listSpecialties();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Add doctor"
        description="Create a new doctor for the clinic."
      />

      <DoctorForm specialties={specialties} />
    </>
  );
}