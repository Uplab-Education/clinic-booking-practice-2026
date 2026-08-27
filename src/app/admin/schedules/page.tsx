import { FilterChipLink } from "@/components/ui/filter-chip-link";
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
  const activeDoctors = doctors.filter((doctor) => doctor.isActive);

  const { doctorId: doctorIdParam } = await searchParams;
  const doctorId = Number(doctorIdParam);
  const hasDoctorId = doctorIdParam !== undefined;

  const selectedDoctor =
    Number.isInteger(doctorId) && doctorId > 0
      ? activeDoctors.find((doctor) => doctor.id === doctorId)
      : undefined;

  const schedule = selectedDoctor
    ? await getDoctorSchedule(selectedDoctor.id)
    : [];

  const doctorNotFound = hasDoctorId && !selectedDoctor;

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

      {activeDoctors.length === 0 ? (
        <EmptyState
          title="No doctors available"
          description="Add or activate a doctor before configuring a weekly schedule."
        />
      ) : (
        <>
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-900">
              Choose doctor
            </p>

            <div className="flex flex-wrap gap-2">
              {activeDoctors.map((doctor) => (
                <FilterChipLink
                  key={doctor.id}
                  href={`/admin/schedules?doctorId=${doctor.id}`}
                  isActive={selectedDoctor?.id === doctor.id}
                >
                  {doctor.fullName}
                </FilterChipLink>
              ))}
            </div>
          </div>

          {doctorNotFound ? (
            <EmptyState
              title="Doctor not found"
              description="The requested doctor does not exist or is inactive."
            />
          ) : !selectedDoctor ? (
            <EmptyState
              title="Choose a doctor"
              description="Select an active doctor to view their weekly schedule."
            />
          ) : (
            <ScheduleEditor doctorId={selectedDoctor.id} entries={schedule} />
          )}
        </>
      )}
    </>
  );
}
