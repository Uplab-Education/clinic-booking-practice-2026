import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { doctorSchedules, type DoctorScheduleEntry } from "@/db/schema";

export async function getDoctorSchedule(doctorId: number): Promise<DoctorScheduleEntry[]> {
  return getDb()
    .select()
    .from(doctorSchedules)
    .where(eq(doctorSchedules.doctorId, doctorId))
    .orderBy(asc(doctorSchedules.weekday));
}

export type ScheduleEntryInput = {
  doctorId: number;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

/**
 * Creates or replaces the schedule entry for one doctor and one weekday.
 * A doctor has at most one working window per weekday
 * (unique index on doctor_id + weekday).
 */
export async function upsertScheduleEntry(input: ScheduleEntryInput): Promise<DoctorScheduleEntry> {
  const [entry] = await getDb()
    .insert(doctorSchedules)
    .values(input)
    .onConflictDoUpdate({
      target: [doctorSchedules.doctorId, doctorSchedules.weekday],
      set: {
        startTime: input.startTime,
        endTime: input.endTime,
        slotMinutes: input.slotMinutes,
      },
    })
    .returning();

  return entry;
}

export async function deleteScheduleEntry(doctorId: number, weekday: number): Promise<boolean> {
  const deleted = await getDb()
    .delete(doctorSchedules)
    .where(and(eq(doctorSchedules.doctorId, doctorId), eq(doctorSchedules.weekday, weekday)))
    .returning();

  return deleted.length > 0;
}
