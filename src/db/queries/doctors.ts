import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { doctors, specialties, type Doctor, type Specialty } from "@/db/schema";

export type DoctorWithSpecialty = Doctor & { specialty: Specialty };

function joinRows(rows: Array<{ doctor: Doctor; specialty: Specialty }>): DoctorWithSpecialty[] {
  return rows.map(({ doctor, specialty }) => ({ ...doctor, specialty }));
}

export async function listSpecialties(): Promise<Specialty[]> {
  return getDb().select().from(specialties).orderBy(asc(specialties.name));
}

/** Active doctors for the patient-facing catalog, optionally filtered by specialty. */
export async function listActiveDoctors(specialtyId?: number): Promise<DoctorWithSpecialty[]> {
  const condition =
    specialtyId === undefined
      ? eq(doctors.isActive, true)
      : and(eq(doctors.isActive, true), eq(doctors.specialtyId, specialtyId));

  const rows = await getDb()
    .select({ doctor: doctors, specialty: specialties })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .where(condition)
    .orderBy(asc(doctors.fullName));

  return joinRows(rows);
}

/** All doctors, including deactivated ones, for the admin table. */
export async function listAllDoctors(): Promise<DoctorWithSpecialty[]> {
  const rows = await getDb()
    .select({ doctor: doctors, specialty: specialties })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .orderBy(asc(doctors.fullName));

  return joinRows(rows);
}

export async function getDoctorById(doctorId: number): Promise<DoctorWithSpecialty | null> {
  const rows = await getDb()
    .select({ doctor: doctors, specialty: specialties })
    .from(doctors)
    .innerJoin(specialties, eq(doctors.specialtyId, specialties.id))
    .where(eq(doctors.id, doctorId));

  return joinRows(rows)[0] ?? null;
}

export type DoctorInput = {
  fullName: string;
  specialtyId: number;
  bio: string;
  room: string | null;
};

export async function createDoctor(input: DoctorInput): Promise<Doctor> {
  const [doctor] = await getDb().insert(doctors).values(input).returning();
  return doctor;
}

export async function updateDoctor(doctorId: number, input: DoctorInput): Promise<Doctor | null> {
  const [doctor] = await getDb()
    .update(doctors)
    .set(input)
    .where(eq(doctors.id, doctorId))
    .returning();

  return doctor ?? null;
}

/** "Deleting" a doctor only deactivates them, so existing appointments keep their history. */
export async function setDoctorActive(doctorId: number, isActive: boolean): Promise<Doctor | null> {
  const [doctor] = await getDb()
    .update(doctors)
    .set({ isActive })
    .where(eq(doctors.id, doctorId))
    .returning();

  return doctor ?? null;
}
