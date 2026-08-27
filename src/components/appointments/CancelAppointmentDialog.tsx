"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Toast } from "@base-ui/react/toast";
import { Button } from "@/components/ui/button";
import { cancelMyAppointment } from "@/app/appointments/actions";

type CancelAppointmentDialogProps = {
  appointmentId: number;
  doctorName: string;
  startsAtLabel: string;
};

export function CancelAppointmentDialog({
  appointmentId,
  doctorName,
  startsAtLabel,
}: CancelAppointmentDialogProps) {
  const toastManager = Toast.useToastManager();

  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      const result = await cancelMyAppointment(appointmentId);

      toastManager.add({
        title: result.ok ? "Cancellation successful" : "Cancellation failed",
        description: result.message,
        data: {
          variant: result.ok ? "success" : "error",
        },
        timeout: result.ok ? 5000 : 8000,
      });

      setOpen(false);
    } catch {
      toastManager.add({
        title: "Cancellation failed",
        description: "Could not cancel this appointment. Please try again.",
        data: {
          variant: "error",
        },
        timeout: 8000,
      });

      setOpen(false);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          setOpen(true);
        }}
      >
        Cancel
      </Button>

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
              {doctorName} on {startsAtLabel}?
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
    </>
  );
}
