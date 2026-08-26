"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/auth/guards";
import { upsertScheduleEntry } from "@/db/queries/schedules";

export type ScheduleActionState = {
  error?: string;
  success?: string;
};

const allowedSlotMinutes = [15, 30, 60];

export async function saveScheduleEntryAction(
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  await requireAdmin();

  const doctorId = Number(formData.get("doctorId"));
  const weekday = Number(formData.get("weekday"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const slotMinutes = Number(formData.get("slotMinutes"));

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return {
      error: "Invalid doctor.",
    };
  }

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return {
      error: "Invalid weekday.",
    };
  }

  if (!startTime || !endTime || startTime >= endTime) {
    return {
      error: "End time must be later than start time.",
    };
  }

  if (!allowedSlotMinutes.includes(slotMinutes)) {
    return {
      error: "Slot length must be 15, 30, or 60 minutes.",
    };
  }

  await upsertScheduleEntry({
    doctorId,
    weekday,
    startTime,
    endTime,
    slotMinutes,
  });

  revalidatePath("/admin/schedules");
  revalidatePath(`/doctors/${doctorId}`);

  return {
    success: "Schedule saved.",
  };
}