"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/auth/guards";
import { getDoctorById } from "@/db/queries/doctors";
import {
  deleteScheduleEntry,
  upsertScheduleEntry,
} from "@/db/queries/schedules";
import { generateSlotTimes } from "@/lib/availability";

export type ScheduleActionState = {
  error?: string;
  success?: string;
};

const allowedSlotMinutes = [15, 30, 60];

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parseScheduleTarget(formData: FormData) {
  const doctorId = Number(formData.get("doctorId"));
  const weekday = Number(formData.get("weekday"));

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return {
      error: "Invalid doctor.",
    } as const;
  }

  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return {
      error: "Invalid weekday.",
    } as const;
  }

  return {
    doctorId,
    weekday,
  };
}

export async function saveScheduleEntryAction(
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  await requireAdmin();

  const target = parseScheduleTarget(formData);

  if ("error" in target) {
    return {
      error: target.error,
    };
  }

  const { doctorId, weekday } = target;

  const doctor = await getDoctorById(doctorId);

  if (!doctor || !doctor.isActive) {
    return {
      error: "Doctor was not found or is inactive.",
    };
  }

  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const slotMinutes = Number(formData.get("slotMinutes"));

  if (!startTime || !endTime) {
    return {
      error: "Start time and end time are required.",
    };
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return {
      error: "Start and end time must be valid times.",
    };
  }

  if (startTime >= endTime) {
    return {
      error: "End time must be later than start time.",
    };
  }

  if (!allowedSlotMinutes.includes(slotMinutes)) {
    return {
      error: "Slot length must be 15, 30, or 60 minutes.",
    };
  }

  const generatedSlots = generateSlotTimes(
    startTime,
    endTime,
    slotMinutes,
  );

  if (generatedSlots.length === 0) {
    return {
      error: "This working window is too short for the selected slot length.",
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

export async function clearScheduleEntryAction(
  _prevState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  await requireAdmin();

  const target = parseScheduleTarget(formData);

  if ("error" in target) {
    return {
      error: target.error,
    };
  }

  const { doctorId, weekday } = target;

  const doctor = await getDoctorById(doctorId);

  if (!doctor || !doctor.isActive) {
    return {
      error: "Doctor was not found or is inactive.",
    };
  }

  const deleted = await deleteScheduleEntry(doctorId, weekday);

  if (!deleted) {
    return {
      error: "This day is already a day off.",
    };
  }

  revalidatePath("/admin/schedules");
  revalidatePath(`/doctors/${doctorId}`);

  return {
    success: "Schedule cleared.",
  };
}