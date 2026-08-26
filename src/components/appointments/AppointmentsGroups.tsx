import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import type { AppointmentWithDoctor } from "@/db/queries/appointments";

type AppointmentGroup = {
  title: string;
  variant: "upcoming" | "past" | "cancelled";
  appointments: AppointmentWithDoctor[];
  emptyMessage: string;
};

type AppointmentsGroupsProps = {
  groups: AppointmentGroup[];
};

export function AppointmentsGroups({
  groups,
}: AppointmentsGroupsProps) {
  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="text-xl font-semibold text-slate-950">
            {group.title}
          </h2>

          {group.appointments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {group.emptyMessage}
            </p>
          ) : (
            <div className="mt-4 grid min-w-0 gap-4">
              {group.appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  variant={group.variant}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
