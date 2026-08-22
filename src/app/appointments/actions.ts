"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/auth/session";
import { cancelAppointment } from "@/db/queries/appointments";

export type CancelAppointmentResult = {
  ok: boolean;
  message: string;
};

export async function cancelMyAppointment(
  appointmentId: number,
): Promise<CancelAppointmentResult> {
  const user = await getCurrentUser();

  if (!user || user.role !== "patient") {
    return {
      ok: false,
      message: "You must be signed in as a patient.",
    };
  }

  const appointment = await cancelAppointment(appointmentId, user.id);

  revalidatePath("/appointments");

  if (!appointment) {
    return {
      ok: false,
      message: "Could not cancel this appointment.",
    };
  }

  return {
    ok: true,
    message: "Appointment cancelled successfully.",
  };
}
