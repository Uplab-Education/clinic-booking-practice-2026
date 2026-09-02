import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["patient", "admin"]);
export const appointmentStatus = pgEnum("appointment_status", ["booked", "cancelled"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("patient"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  specialtyId: integer("specialty_id")
    .notNull()
    .references(() => specialties.id),
  bio: text("bio").notNull().default(""),
  room: text("room"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const doctorSchedules = pgTable(
  "doctor_schedules",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id),
    // Day of week following JavaScript Date.getDay(): 0 = Sunday, 1 = Monday, ... 6 = Saturday.
    weekday: integer("weekday").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    slotMinutes: integer("slot_minutes").notNull(),
  },
  (table) => [
    uniqueIndex("doctor_schedules_doctor_weekday_unique").on(table.doctorId, table.weekday),
    check("doctor_schedules_weekday_range", sql`${table.weekday} BETWEEN 0 AND 6`),
    check("doctor_schedules_slot_minutes_allowed", sql`${table.slotMinutes} IN (15, 30, 60)`),
    check("doctor_schedules_time_order", sql`${table.startTime} < ${table.endTime}`),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    doctorId: integer("doctor_id")
      .notNull()
      .references(() => doctors.id),
    patientId: integer("patient_id")
      .notNull()
      .references(() => users.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: appointmentStatus("status").notNull().default("booked"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    comment: text("comment"),
  },
  (table) => [
    // The core double-booking guard: at most one *booked* appointment per doctor
    // per start time. Cancelled rows stay in place as history and do not block
    // the slot from being booked again.
    uniqueIndex("appointments_doctor_starts_at_booked_unique")
      .on(table.doctorId, table.startsAt)
      .where(sql`${table.status} = 'booked'`),
  ],
);

export type User = typeof users.$inferSelect;
export type Specialty = typeof specialties.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type DoctorScheduleEntry = typeof doctorSchedules.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type AppointmentStatus = (typeof appointmentStatus.enumValues)[number];
