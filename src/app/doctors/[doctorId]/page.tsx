import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { getDoctorById } from "@/db/queries/doctors";
import { listAvailableSlots } from "@/db/queries/appointments";
import { BookingSlotPicker } from "@/components/booking/BookingSlotPicker";
import { groupSlotsByDay } from "@/lib/availability";
import { formatPhoneNumber } from "@/lib/phone";

type DoctorProfilePageProps = {
  params: Promise<{ doctorId: string }>;
};

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const { doctorId } = await params;
  const parsedDoctorId = Number(doctorId);

  if (!Number.isInteger(parsedDoctorId) || parsedDoctorId <= 0) {
    return (
      <EmptyState
        title="Doctor not found"
        description="The requested doctor does not exist or is no longer available."
        action={
          <Button asChild href="/doctors">
            Back to doctors
          </Button>
        }
      />
    );
  }

  const doctor = await getDoctorById(parsedDoctorId);

  if (!doctor || !doctor.isActive) {
    return (
      <EmptyState
        title="Doctor not found"
        description="The requested doctor does not exist or is no longer available."
        action={
          <Button asChild href="/doctors">
            Back to doctors
          </Button>
        }
      />
    );
  }

  const slots = await listAvailableSlots(parsedDoctorId);
  const days = groupSlotsByDay(slots);

  return (
    <>
      <PageHeader
        eyebrow="Doctors"
        title={doctor.fullName}
        description={doctor.specialty.name}
      />

      <div className="mt-6">
        <Button asChild href="/doctors" variant="secondary">
          Back to doctors
        </Button>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          {doctor.specialty.name}
        </p>

        {doctor.specialty.description ? (
          <p className="mt-1 text-sm text-slate-500">
            {doctor.specialty.description}
          </p>
        ) : null}

        {doctor.room ? (
          <p className="mt-2 text-sm text-slate-600">
            Room: {doctor.room}
          </p>
        ) : null}

        {doctor.phone ? (
          <p className="mt-2 text-sm text-slate-600">
            Phone: {formatPhoneNumber(doctor.phone)}
          </p>
        ) : null}

        {doctor.bio ? (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {doctor.bio}
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-950">
          Available time slots
        </h2>

        {days.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No available slots"
              description="This doctor has no free time slots in the next 14 days."
            />
          </div>
        ) : (
          <BookingSlotPicker doctor={doctor} days={days} />
        )}
      </section>
    </>
  );
}