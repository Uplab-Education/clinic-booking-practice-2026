// Pure availability helpers. No database access here: everything in this file
// is a plain function over plain data, so it can be unit-tested without any
// infrastructure. The database query layer (src/db/queries) feeds these
// functions with schedule entries and booked appointment times.

// All schedule times are interpreted in the clinic's local time zone. Using a
// single fixed zone (instead of the server's or visitor's zone) keeps server
// and client rendering identical and avoids hydration mismatches.
export const CLINIC_TIME_ZONE = "Europe/Kyiv";

export type ScheduleEntryInput = {
  // 0 = Sunday ... 6 = Saturday, same as JavaScript Date.getDay().
  weekday: number;
  // "09:00" or "09:00:00"
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

export type FreeSlot = {
  startsAt: Date;
  endsAt: Date;
};

export type DaySlots = {
  dateIso: string;
  dayLabel: string;
  slots: FreeSlot[];
};

function parseTimeToMinutes(value: string) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Generates slot start times ("HH:MM") between startTime and endTime.
 * The last slot always ends at or before endTime.
 *
 * generateSlotTimes("09:00", "11:00", 30) -> ["09:00", "09:30", "10:00", "10:30"]
 */
export function generateSlotTimes(startTime: string, endTime: string, slotMinutes: number) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const times: string[] = [];

  if (slotMinutes <= 0) {
    return times;
  }

  for (let minute = start; minute + slotMinutes <= end; minute += slotMinutes) {
    times.push(formatMinutesAsTime(minute));
  }

  return times;
}

function timeZoneOffsetMs(timeZone: string, utcDate: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(utcDate);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - utcDate.getTime();
}

/**
 * Builds the exact instant for a clinic-local date and time,
 * e.g. clinicDateTime("2026-08-17", "09:00") = 09:00 in Kyiv on that day.
 */
export function clinicDateTime(dateIso: string, timeValue: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  const minutes = parseTimeToMinutes(timeValue);
  const naiveUtc = Date.UTC(year, month - 1, day, 0, minutes);
  // Two passes converge on the correct offset around DST transitions.
  let offset = timeZoneOffsetMs(CLINIC_TIME_ZONE, new Date(naiveUtc));
  offset = timeZoneOffsetMs(CLINIC_TIME_ZONE, new Date(naiveUtc - offset));
  return new Date(naiveUtc - offset);
}

/** "2026-08-17" for the given instant, in clinic time. */
export function clinicDateIso(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Day of week (0 = Sunday ... 6 = Saturday) of the given instant, in clinic time. */
export function clinicWeekday(date: Date) {
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "short",
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
}

/** "09:00" in clinic time. */
export function formatSlotTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** "Monday, 17 August" in clinic time. */
export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** "Monday, 17 August, 09:00" in clinic time. */
export function formatAppointmentTime(date: Date) {
  return `${formatDayLabel(date)}, ${formatSlotTime(date)}`;
}

/**
 * Computes free (not yet booked, in the future) slots for one doctor.
 *
 * @param schedule the doctor's weekly schedule entries
 * @param bookedStartTimes start times of appointments with status "booked"
 * @param from only slots strictly after this instant are returned
 * @param days how many calendar days (starting at `from`) to scan
 */
export function computeFreeSlots(
  schedule: ScheduleEntryInput[],
  bookedStartTimes: Date[],
  from: Date,
  days: number,
): FreeSlot[] {
  const booked = new Set(bookedStartTimes.map((date) => date.getTime()));
  const slots: FreeSlot[] = [];
  // Probing from noon keeps day arithmetic stable across DST transitions.
  const firstNoon = clinicDateTime(clinicDateIso(from), "12:00");

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const dayProbe = new Date(firstNoon.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateIso = clinicDateIso(dayProbe);
    const weekday = clinicWeekday(dayProbe);
    const entry = schedule.find((candidate) => candidate.weekday === weekday);

    if (!entry) {
      continue;
    }

    for (const timeValue of generateSlotTimes(entry.startTime, entry.endTime, entry.slotMinutes)) {
      const startsAt = clinicDateTime(dateIso, timeValue);

      if (startsAt.getTime() <= from.getTime() || booked.has(startsAt.getTime())) {
        continue;
      }

      slots.push({
        startsAt,
        endsAt: new Date(startsAt.getTime() + entry.slotMinutes * 60 * 1000),
      });
    }
  }

  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

/** Groups slots by clinic-local day, in chronological order. */
export function groupSlotsByDay(slots: FreeSlot[]): DaySlots[] {
  const groups = new Map<string, DaySlots>();

  for (const slot of [...slots].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())) {
    const dateIso = clinicDateIso(slot.startsAt);
    const existing = groups.get(dateIso);

    if (existing) {
      existing.slots.push(slot);
    } else {
      groups.set(dateIso, {
        dateIso,
        dayLabel: formatDayLabel(slot.startsAt),
        slots: [slot],
      });
    }
  }

  return [...groups.values()];
}
