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
  reason?: "slot-taken" | "validation";
};

export async function bookDoctorSlot(
  doctorId: number,
  startsAtIso: string,
  comment: string,
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
      reason: "validation",
    };
  }

  const normalizedComment = comment.trim();

  if (normalizedComment.length > 500) {
    return {
      ok: false,
      message: "Comment must be 500 characters or fewer.",
      reason: "validation",
    };
  }

  try {
    await bookAppointment({
      doctorId,
      patientId: user.id,
      startsAt,
      comment: normalizedComment || null,
    });

    revalidatePath(`/doctors/${doctorId}`);

    return {
      ok: true,
      message: "Appointment booked successfully.",
    };
  } catch (error) {
    if (error instanceof SlotTakenError) {
      revalidatePath(`/doctors/${doctorId}`);

      return {
        ok: false,
        message: "This time has just been taken, please pick another one.",
        reason: "slot-taken",
      };
    }

    if (error instanceof InvalidSlotError) {
      revalidatePath(`/doctors/${doctorId}`);

      return {
        ok: false,
        message: error.message,
        reason: "validation",
      };
    }

    throw error;
  }
}
