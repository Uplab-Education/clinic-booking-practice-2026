"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/auth/session";
import { bookAppointment } from "@/db/queries/appointments";
import {
  InvalidSlotError,
  SlotTakenError,
} from "@/db/errors";

export type BookSlotResult = {
  ok: boolean;
  message: string;
};

export async function bookDoctorSlot(
  doctorId: number,
  startsAtIso: string,
): Promise<BookSlotResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    return {
      ok: false,
      message: "You must be signed in as a patient to book an appointment.",
    };
  }

  const startsAt = new Date(startsAtIso);

  if (Number.isNaN(startsAt.getTime())) {
    return {
      ok: false,
      message: "Invalid appointment time.",
    };
  }

  try {
    await bookAppointment({
      doctorId,
      patientId: user.id,
      startsAt,
    });

    revalidatePath(`/doctors/${doctorId}`);

    return {
      ok: true,
      message: "Appointment booked successfully.",
    };
  } catch (error) {
    if (error instanceof SlotTakenError || error instanceof InvalidSlotError) {
      revalidatePath(`/doctors/${doctorId}`);

      return {
        ok: false,
        message: "This time has just been taken, please pick another one.",
      };
    }

    throw error;
  }
}
