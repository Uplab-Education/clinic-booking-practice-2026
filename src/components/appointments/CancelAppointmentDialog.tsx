"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { cancelMyAppointment } from "@/app/appointments/actions";

type CancelAppointmentDialogProps = {
  appointmentId: number;
  onResult: (message: string) => void;
};

export function CancelAppointmentDialog({
  appointmentId,
  onResult,
}: CancelAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setIsCancelling(true);

    try {
      const result = await cancelMyAppointment(appointmentId);

      onResult(result.message);
      setOpen(false);
    } catch {
      onResult("Could not cancel this appointment. Please try again.");
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
          onResult("");
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
              Are you sure you want to cancel this appointment?
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
