"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useAuth } from "@/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { bookDoctorSlot } from "@/app/doctors/[doctorId]/actions";
import type { DoctorWithSpecialty } from "@/db/queries/doctors";
import {
  formatDayLabel,
  formatSlotTime,
  type FreeSlot,
} from "@/lib/availability";

type BookingSlotPickerProps = {
  doctor: DoctorWithSpecialty;
  days: Array<{
    dateIso: string;
    dayLabel: string;
    slots: FreeSlot[];
  }>;
};

export function BookingSlotPicker({
  doctor,
  days,
}: BookingSlotPickerProps) {
  const { user } = useAuth();

  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);
  const [message, setMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  if (user?.role === "admin") {
    return null;
  }

  if (!user) {
    return (
      <div className="mt-4">
        <Button asChild href="/login" variant="secondary">
          Log in to book
        </Button>
      </div>
    );
  }

  async function handleBooking() {
    if (!selectedSlot || isBooking) {
      return;
    }

    setIsBooking(true);
    setMessage("");

    const result = await bookDoctorSlot(
      doctor.id,
      selectedSlot.startsAt.toISOString(),
    );

    setIsBooking(false);
    setSelectedSlot(null);
    setMessage(result.message);
  }

  return (
    <>
      <div className="mt-4 space-y-6">
        <div aria-live="polite" className="min-h-5">
          {message ? (
            <p className="text-sm font-medium text-slate-700">
              {message}
            </p>
          ) : null}
        </div>

        {days.map((day) => (
          <section key={day.dateIso}>
            <h3 className="text-base font-semibold text-slate-950">
              {day.dayLabel}
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {day.slots.map((slot) => (
                <Button
                  key={slot.startsAt.toISOString()}
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMessage("");
                    setSelectedSlot(slot);
                  }}
                >
                  {formatSlotTime(slot.startsAt)}
                </Button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Dialog.Root
        open={selectedSlot !== null}
        onOpenChange={(open) => {
          if (!open && !isBooking) {
            setSelectedSlot(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/30" />

          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold text-slate-950">
              Confirm booking
            </Dialog.Title>

            {selectedSlot ? (
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                {doctor.fullName} —{" "}
                {formatDayLabel(selectedSlot.startsAt)} at{" "}
                {formatSlotTime(selectedSlot.startsAt)}
              </Dialog.Description>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isBooking}
                onClick={() => {
                  setSelectedSlot(null);
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={isBooking}
                onClick={() => {
                  void handleBooking();
                }}
              >
                {isBooking ? "Booking..." : "Confirm booking"}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
