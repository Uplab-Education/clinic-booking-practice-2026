// Typed errors thrown by the query layer. Pages and server actions catch these
// to show friendly messages instead of crashing with a raw database error.

/** Thrown when two patients try to book the same slot: the second insert
 * violates the partial unique index on (doctor_id, starts_at). */
export class SlotTakenError extends Error {
  constructor() {
    super("This time slot has just been booked by someone else.");
    this.name = "SlotTakenError";
  }
}

/** Thrown when a booking request does not match the doctor's schedule
 * (wrong time, past date, inactive doctor). */
export class InvalidSlotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSlotError";
  }
}

/** Postgres unique constraint violation code. */
export const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  // Drizzle wraps the driver error in DrizzleQueryError with the original
  // Postgres error as `cause`, so check both levels.
  const candidate = error as { code?: string; cause?: { code?: string } };

  return (
    candidate.code === UNIQUE_VIOLATION || candidate.cause?.code === UNIQUE_VIOLATION
  );
}
