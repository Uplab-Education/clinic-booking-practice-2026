"use client";

import { useState } from "react";
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
  const [message, setMessage] = useState("");

  return (
    <>
      <div
        aria-live="polite"
        className="min-h-5 text-sm font-medium text-slate-700"
      >
        {message}
      </div>

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
                    onResult={setMessage}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
