// Seed script for local development and the practice environment.
// Runs with plain Node (type stripping), no bundler:
//   npm run db:seed
// It RESETS all data: every table is truncated and refilled, so it is safe to
// run repeatedly, and it is the fastest way back to a known-good state.

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPassword } from "../auth/passwords.ts";
import { computeFreeSlots } from "../lib/availability.ts";
import {
  appointments,
  doctorSchedules,
  doctors,
  specialties,
  users,
} from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  process.exit(1);
}

const client = postgres(databaseUrl, { max: 1, prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("Resetting tables...");
  await db.execute(
    `TRUNCATE appointments, doctor_schedules, doctors, specialties, users RESTART IDENTITY CASCADE`,
  );

  console.log("Inserting users...");
  const [admin, olena, taras] = await db
    .insert(users)
    .values([
      {
        name: "Clinic Admin",
        email: "admin@clinic.test",
        passwordHash: hashPassword("password"),
        role: "admin",
      },
      {
        name: "Olena Petrenko",
        email: "olena@patient.test",
        passwordHash: hashPassword("password"),
        role: "patient",
      },
      {
        name: "Taras Kovalenko",
        email: "taras@patient.test",
        passwordHash: hashPassword("password"),
        role: "patient",
      },
    ])
    .returning();

  console.log("Inserting specialties...");
  const insertedSpecialties = await db
    .insert(specialties)
    .values([
      { name: "Therapist" },
      { name: "Cardiologist" },
      { name: "Dermatologist" },
      { name: "Pediatrician" },
    ])
    .returning();

  const specialtyId = new Map(insertedSpecialties.map((row) => [row.name, row.id]));

  console.log("Inserting doctors...");
  const insertedDoctors = await db
    .insert(doctors)
    .values([
      {
        fullName: "Dr. Iryna Shevchenko",
        specialtyId: specialtyId.get("Therapist")!,
        bio: "General practitioner with 12 years of experience in family medicine.",
        room: "101",
      },
      {
        fullName: "Dr. Andrii Bondar",
        specialtyId: specialtyId.get("Cardiologist")!,
        bio: "Cardiologist focused on prevention and hypertension treatment.",
        room: "204",
      },
      {
        fullName: "Dr. Kateryna Melnyk",
        specialtyId: specialtyId.get("Dermatologist")!,
        bio: "Dermatologist specializing in adult and pediatric skin care.",
        room: "310",
      },
      {
        fullName: "Dr. Oksana Tkachenko",
        specialtyId: specialtyId.get("Pediatrician")!,
        bio: "Pediatrician who works with children from birth to 18 years.",
        room: "115",
      },
      {
        fullName: "Dr. Serhii Kravets",
        specialtyId: specialtyId.get("Therapist")!,
        bio: "Therapist with a focus on preventive check-ups and chronic care.",
        room: "102",
      },
      {
        fullName: "Dr. Mykola Horbach",
        specialtyId: specialtyId.get("Cardiologist")!,
        bio: "Retired from regular practice; kept for appointment history.",
        room: null,
        isActive: false,
      },
    ])
    .returning();

  const activeDoctors = insertedDoctors.filter((doctor) => doctor.isActive);

  console.log("Inserting schedules...");
  // Vary the schedules so the UI has something interesting to show:
  // even-indexed doctors work Mon-Fri, odd-indexed ones Mon/Wed/Fri,
  // Fridays are short days, and the pediatrician has 60-minute slots.
  await db.insert(doctorSchedules).values(
    activeDoctors.flatMap((doctor, index) => {
      const weekdays = index % 2 === 0 ? [1, 2, 3, 4, 5] : [1, 3, 5];
      const slotMinutes = doctor.fullName.includes("Oksana") ? 60 : 30;

      return weekdays.map((weekday) => ({
        doctorId: doctor.id,
        weekday,
        startTime: "09:00",
        endTime: weekday === 5 ? "13:00" : "17:00",
        slotMinutes,
      }));
    }),
  );

  console.log("Inserting appointments...");
  const now = new Date();
  const bookedValues = [];

  // Two booked appointments per doctor for the first three doctors,
  // placed on real future slots computed from the schedules above.
  for (const [index, doctor] of activeDoctors.slice(0, 3).entries()) {
    const schedule = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctor.id));
    const freeSlots = computeFreeSlots(schedule, [], now, 14);
    const patient = index % 2 === 0 ? olena : taras;

    for (const slot of freeSlots.slice(0, 2)) {
      bookedValues.push({
        doctorId: doctor.id,
        patientId: patient.id,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      });
    }
  }

  await db.insert(appointments).values(bookedValues);

  // One cancelled appointment so status filters and history have data.
  const firstDoctor = activeDoctors[0];
  const firstSchedule = await db
    .select()
    .from(doctorSchedules)
    .where(eq(doctorSchedules.doctorId, firstDoctor.id));
  const cancelledSlot = computeFreeSlots(
    firstSchedule,
    bookedValues.map((appointment) => appointment.startsAt),
    now,
    14,
  )[0];

  await db.insert(appointments).values({
    doctorId: firstDoctor.id,
    patientId: taras.id,
    startsAt: cancelledSlot.startsAt,
    endsAt: cancelledSlot.endsAt,
    status: "cancelled",
    cancelledAt: now,
  });

  console.log("Seed complete:");
  console.log(`  users: 3 (admin: ${admin.email}, patients: ${olena.email}, ${taras.email})`);
  console.log(`  specialties: ${insertedSpecialties.length}`);
  console.log(`  doctors: ${insertedDoctors.length} (${activeDoctors.length} active)`);
  console.log(`  appointments: ${bookedValues.length + 1} (1 cancelled)`);
  console.log("All seeded accounts use the password: password");
}

try {
  await seed();
} finally {
  await client.end();
}
