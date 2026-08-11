import { and, asc, desc, eq, gt } from "drizzle-orm";
import { getDb } from "@/db/client";
import { InvalidSlotError, SlotTakenError, isUniqueViolation } from "@/db/errors";
import {
  appointments,
  doctors,
  specialties,
  users,
  type Appointment,
  type AppointmentStatus,
  type Doctor,
  type Specialty,
} from "@/db/schema";
import { computeFreeSlots, type FreeSlot } from "@/lib/availability";
import { getDoctorById } from "./doctors";
import { getDoctorSchedule } from "./schedules";

export const AVAILABILITY_DAYS = 14;

/**
 * Free future slots for one doctor over the next AVAILABILITY_DAYS days,
 * derived from the weekly schedule minus booked appointments.
 */
export async function listAvailableSlots(doctorId: number): Promise<FreeSlot[]> {
  const now = new Date();
  const [schedule, booked] = await Promise.all([
    getDoctorSchedule(doctorId),
    getDb()
      .select({ startsAt: appointments.startsAt })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.status, "booked"),
          gt(appointments.startsAt, now),
        ),
      ),
  ]);

  return computeFreeSlots(
    schedule,
    booked.map((row) => row.startsAt),
    now,
    AVAILABILITY_DAYS,
  );
}

/**
 * Books a slot for a patient.
 *
 * Validates that the requested time matches the doctor's current schedule and
 * lies in the future, then inserts. If another patient books the same time
 * first, the partial unique index on (doctor_id, starts_at) makes this insert
 * fail with Postgres error 23505 - surfaced as SlotTakenError so the UI can
 * show a friendly message.
 *
 * @throws InvalidSlotError when the time does not match the schedule
 * @throws SlotTakenError when the slot was booked by someone else first
 */
export async function bookAppointment(input: {
  doctorId: number;
  patientId: number;
  startsAt: Date;
}): Promise<Appointment> {
  const doctor = await getDoctorById(input.doctorId);

  if (!doctor || !doctor.isActive) {
    throw new InvalidSlotError("This doctor is not available for booking.");
  }

  const schedule = await getDoctorSchedule(input.doctorId);
  const candidates = computeFreeSlots(schedule, [], new Date(), AVAILABILITY_DAYS);
  const slot = candidates.find(
    (candidate) => candidate.startsAt.getTime() === input.startsAt.getTime(),
  );

  if (!slot) {
    throw new InvalidSlotError("This time does not match the doctor's schedule.");
  }

  try {
    const [appointment] = await getDb()
      .insert(appointments)
      .values({
        doctorId: input.doctorId,
        patientId: input.patientId,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      })
      .returning();

    return appointment;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new SlotTakenError();
    }

    throw error;
  }
}

/**
 * Cancels a patient's own booked appointment. Returns null when the
 * appointment does not exist, belongs to someone else, or is already
 * cancelled. Cancelling frees the slot for other patients while keeping
 * the row as history.
 */
export async function cancelAppointment(
  appointmentId: number,
  patientId: number,
): Promise<Appointment | null> {
  const [appointment] = await getDb()
    .update(appointments)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.patientId, patientId),
        eq(appointments.status, "booked"),
      ),
    )
    .returning();

  return appointment ?? null;
}

export type AppointmentWithDoctor = Appointment & {
  doctor: Doctor;
  specialty: Specialty;
};

export type AppointmentWithDetails = AppointmentWithDoctor & {
  patient: { id: number; name: string; email: string };
};

/** A patient's own appointments, upcoming first. */
export async function listPatientAppointments(
  patientId: number,
): Promise<AppointmentWithDoctor[]> {
  const rows = await getDb()
    .select({ appointment: appointments, doctor: doctors, specialty: specialties })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .where(eq(appointments.patientId, patientId))
    .orderBy(desc(appointments.startsAt));

  return rows.map(({ appointment, doctor, specialty }) => ({
    ...appointment,
    doctor,
    specialty,
  }));
}

export type AppointmentFilters = {
  doctorId?: number;
  status?: AppointmentStatus;
};

/** All appointments for the admin overview, with optional filters. */
export async function listAllAppointments(
  filters: AppointmentFilters = {},
): Promise<AppointmentWithDetails[]> {
  const conditions = [
    filters.doctorId === undefined ? undefined : eq(appointments.doctorId, filters.doctorId),
    filters.status === undefined ? undefined : eq(appointments.status, filters.status),
  ].filter((condition) => condition !== undefined);

  const rows = await getDb()
    .select({
      appointment: appointments,
      doctor: doctors,
      specialty: specialties,
      patient: { id: users.id, name: users.name, email: users.email },
    })
    .from(appointments)
    .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .innerJoin(users, eq(appointments.patientId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(appointments.startsAt));

  return rows.map(({ appointment, doctor, specialty, patient }) => ({
    ...appointment,
    doctor,
    specialty,
    patient,
  }));
}
