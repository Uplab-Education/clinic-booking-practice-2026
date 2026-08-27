import { formatAppointmentTime } from "@/lib/availability";
import type { AppointmentWithDoctor } from "@/db/queries/appointments";
import { CancelAppointmentDialog } from "@/components/appointments/CancelAppointmentDialog";

type AppointmentCardProps = {
  appointment: AppointmentWithDoctor;
  variant: "upcoming" | "past" | "cancelled";
};

export function AppointmentCard({
  appointment,
  variant,
}: AppointmentCardProps) {
  const canCancel = variant === "upcoming";

  const statusLabel =
    variant === "upcoming"
      ? "Upcoming"
      : variant === "past"
        ? "Past"
        : "Cancelled";

  return (
    <article className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {appointment.doctor.fullName}
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            {appointment.specialty.name}
          </p>

          <p className="mt-3 text-sm font-medium text-slate-700">
            {formatAppointmentTime(appointment.startsAt)}
          </p>
        </div>

        <span className="w-fit rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
          Status: {statusLabel}
        </span>
      </div>

      {canCancel ? (
        <div className="mt-4">
          <CancelAppointmentDialog
            appointmentId={appointment.id}
            doctorName={appointment.doctor.fullName}
            startsAtLabel={formatAppointmentTime(appointment.startsAt)}
          />
        </div>
      ) : null}
    </article>
  );
}
