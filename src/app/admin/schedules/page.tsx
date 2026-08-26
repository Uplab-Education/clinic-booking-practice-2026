import Link from "next/link";

import { requireAdmin } from "@/auth/guards";
import { ScheduleEditor } from "@/components/admin/ScheduleEditor";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { listAllDoctors } from "@/db/queries/doctors";
import { getDoctorSchedule } from "@/db/queries/schedules";

type AdminSchedulesPageProps = {
  searchParams: Promise<{
    doctorId?: string;
  }>;
};

export default async function AdminSchedulesPage({
  searchParams,
}: AdminSchedulesPageProps) {
  await requireAdmin();

  const doctors = await listAllDoctors();
  const { doctorId: doctorIdParam } = await searchParams;

  const doctorId = Number(doctorIdParam);

  const selectedDoctor =
    Number.isInteger(doctorId) && doctorId > 0
      ? doctors.find((doctor) => doctor.id === doctorId)
      : undefined;

  const schedule = selectedDoctor
    ? await getDoctorSchedule(selectedDoctor.id)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Schedules"
        description="Set each doctor's weekly working hours and appointment slot length."
      />
      <p className="mb-6 text-sm leading-6 text-slate-600">
        Changes to a weekly schedule update the free slots shown to patients.
        Existing appointments are never modified.
      </p>

      {doctors.length === 0 ? (
        <EmptyState
          title="No doctors available"
          description="Add a doctor before configuring a weekly schedule."
        />
      ) : (
        <>
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-900">
              Choose doctor
            </p>

            <div className="flex flex-wrap gap-2">
              {doctors.map((doctor) => (
                <Link
                  key={doctor.id}
                  href={`/admin/schedules?doctorId=${doctor.id}`}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    selectedDoctor?.id === doctor.id
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  {doctor.fullName}
                </Link>
              ))}
            </div>
          </div>

          {!selectedDoctor ? (
            <EmptyState
              title="Choose a doctor"
              description="Select a doctor to view their weekly schedule."
            />
          ) : (
            <ScheduleEditor doctorId={selectedDoctor.id} entries={schedule} />
          )}
        </>
      )}
    </>
  );
}
