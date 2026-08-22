"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { cancelMyAppointment } from "@/app/appointments/actions";
import { formatAppointmentTime } from "@/lib/availability";
import type { AppointmentWithDoctor } from "@/db/queries/appointments";

type AppointmentCardProps = {
  appointment: AppointmentWithDoctor;
  variant: "upcoming" | "past" | "cancelled";
};

export function AppointmentCard({
  appointment,
  variant,
}: AppointmentCardProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const canCancel = variant === "upcoming";

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);
    setMessage("");

    const result = await cancelMyAppointment(appointment.id);

    setIsCancelling(false);
    setMessage(result.message);

    if (result.ok) {
      setOpen(false);
    }
  }

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
          <h3 className="truncate text-base font-semibold text-slate-950">
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setMessage("");
              setOpen(true);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : null}

      {message ? (
        <p
          className="mt-4 text-sm font-medium text-slate-700"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      {canCancel ? (
        <Dialog.Root
          open={open}
          onOpenChange={(nextOpen) => {
            if (!isCancelling) {
              setOpen(nextOpen);
            }
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30" />

            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-semibold text-slate-950">
                Cancel appointment?
              </Dialog.Title>

              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                Are you sure you want to cancel your appointment with{" "}
                {appointment.doctor.fullName} on{" "}
                {formatAppointmentTime(appointment.startsAt)}?
              </Dialog.Description>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isCancelling}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Keep appointment
                </Button>

                <Button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => {
                    void handleCancel();
                  }}
                >
                  {isCancelling ? "Cancelling..." : "Cancel appointment"}
                </Button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null}
    </article>
  );
}
