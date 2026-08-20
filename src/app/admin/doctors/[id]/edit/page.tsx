import { notFound } from "next/navigation";

import { requireAdmin } from "@/auth/guards";
import { DoctorForm } from "@/components/admin/DoctorForm";
import { PageHeader } from "@/components/ui/page-header";
import { getDoctorById, listSpecialties } from "@/db/queries/doctors";

type EditDoctorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditDoctorPage({ params }: EditDoctorPageProps) {
  await requireAdmin();

  const { id } = await params;
  const doctorId = Number(id);

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    notFound();
  }

  const doctor = await getDoctorById(doctorId);

  if (!doctor) {
    notFound();
  }

  const specialties = await listSpecialties();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Edit doctor"
        description="Update doctor information."
      />

      <DoctorForm specialties={specialties} doctor={doctor} />
    </>
  );
}
