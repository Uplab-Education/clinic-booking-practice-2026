import { requireUser } from "@/auth/guards";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
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
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-slate-950">
              Upcoming
            </h2>

            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No upcoming appointments.
              </p>
            ) : (
              <div className="mt-4 grid min-w-0 gap-4">
                {upcoming.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="upcoming"
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-950">
              Past
            </h2>

            {past.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No past appointments.
              </p>
            ) : (
              <div className="mt-4 grid min-w-0 gap-4">
                {past.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="past"
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-950">
              Cancelled
            </h2>

            {cancelled.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No cancelled appointments.
              </p>
            ) : (
              <div className="mt-4 grid min-w-0 gap-4">
                {cancelled.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    variant="cancelled"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
