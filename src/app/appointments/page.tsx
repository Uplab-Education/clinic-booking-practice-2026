import { requireUser } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AppointmentsGroups } from "@/components/appointments/AppointmentsGroups";
import { listPatientAppointments } from "@/db/queries/appointments";

export default async function AppointmentsPage() {
  const user = await requireUser();
  const appointments = await listPatientAppointments(user.id);
  const now = new Date();

  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === "booked" && appointment.startsAt > now,
  );

  const past = appointments.filter(
    (appointment) =>
      appointment.status === "booked" && appointment.startsAt <= now,
  );

  const cancelled = appointments.filter(
    (appointment) => appointment.status === "cancelled",
  );

  const groups = [
    {
      title: "Upcoming",
      variant: "upcoming" as const,
      appointments: upcoming,
      emptyMessage: "No upcoming appointments.",
    },
    {
      title: "Past",
      variant: "past" as const,
      appointments: past,
      emptyMessage: "No past appointments.",
    },
    {
      title: "Cancelled",
      variant: "cancelled" as const,
      appointments: cancelled,
      emptyMessage: "No cancelled appointments.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Appointments"
        title="My appointments"
        description="Review your upcoming visits, see past and cancelled ones, and cancel a booking when plans change."
      />

      {appointments.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No appointments"
            description="You do not have any appointments yet. Browse doctors to book a visit."
            action={
              <Button asChild href="/doctors">
                Browse doctors
              </Button>
            }
          />
        </div>
      ) : (
        <AppointmentsGroups groups={groups} />
      )}
    </>
  );
}
