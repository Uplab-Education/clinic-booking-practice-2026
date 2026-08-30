import { describe, expect, it } from "vitest";
import {
  clinicDateTime,
  computeFreeSlots,
  formatAppointmentTime,
  formatDayLabel,
  formatSlotTime,
  generateSlotTimes,
  groupSlotsByDay,
} from "./availability";

// 2026-08-17 is a Monday.
const monday = "2026-08-17";
const mondaySchedule = [
  {
    weekday: 1,
    startTime: "09:00",
    endTime: "11:00",
    slotMinutes: 30,
  },
];

// A Sunday evening "now", so every Monday slot is in the future.
const sundayEvening = clinicDateTime("2026-08-16", "20:00");

describe("generateSlotTimes", () => {
  it("generates start times so that the last slot ends at or before endTime", () => {
    expect(generateSlotTimes("09:00", "11:00", 30)).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ]);
  });

  it("drops a trailing slot that would not fit", () => {
    expect(generateSlotTimes("09:00", "10:45", 30)).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  it("returns an empty list when the window is shorter than one slot", () => {
    expect(generateSlotTimes("09:00", "09:15", 30)).toEqual([]);
  });
});

describe("computeFreeSlots", () => {
  it("returns every schedule slot when nothing is booked", () => {
    const slots = computeFreeSlots(mondaySchedule, [], sundayEvening, 2);

    expect(slots).toHaveLength(4);
    expect(slots[0].startsAt).toEqual(clinicDateTime(monday, "09:00"));
    expect(slots[0].endsAt).toEqual(clinicDateTime(monday, "09:30"));
  });

  it("excludes booked start times", () => {
    const booked = [clinicDateTime(monday, "09:30")];
    const slots = computeFreeSlots(
      mondaySchedule,
      booked,
      sundayEvening,
      2,
    );

    expect(slots).toHaveLength(3);
    expect(slots.map((slot) => slot.startsAt)).not.toContainEqual(booked[0]);
  });

  it("excludes slots that are already in the past", () => {
    const mondayMorning = clinicDateTime(monday, "09:10");
    const slots = computeFreeSlots(mondaySchedule, [], mondayMorning, 1);

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      clinicDateTime(monday, "09:30"),
      clinicDateTime(monday, "10:00"),
      clinicDateTime(monday, "10:30"),
    ]);
  });

  it("skips days that have no schedule entry", () => {
    // The schedule only covers Monday, so a 7-day scan still yields Monday slots only.
    const slots = computeFreeSlots(mondaySchedule, [], sundayEvening, 7);

    expect(slots).toHaveLength(4);
  });
});

describe("formatSlotTime", () => {
  it("formats an instant as a clinic-local time", () => {
    const date = new Date("2026-08-17T06:00:00.000Z");

    expect(formatSlotTime(date)).toBe("09:00");
  });

  it("uses the clinic time zone when UTC falls on the previous calendar day", () => {
    const date = new Date("2026-08-16T21:30:00.000Z");

    expect(formatSlotTime(date)).toBe("00:30");
  });
});

describe("formatDayLabel", () => {
  it("formats the clinic-local day and month", () => {
    const date = new Date("2026-08-17T06:00:00.000Z");

    expect(formatDayLabel(date)).toBe("Monday 17 August");
  });

  it("uses the clinic calendar day instead of the UTC calendar day", () => {
    const date = new Date("2026-08-16T21:30:00.000Z");

    expect(formatDayLabel(date)).toBe("Monday 17 August");
  });
});

describe("formatAppointmentTime", () => {
  it("formats the appointment day and time in the clinic time zone", () => {
    const date = new Date("2026-08-17T06:00:00.000Z");

    expect(formatAppointmentTime(date)).toBe(
      "Monday 17 August, 09:00",
    );
  });

  it("keeps the Kyiv calendar day when UTC is still on the previous day", () => {
    const date = new Date("2026-08-16T21:30:00.000Z");

    expect(formatAppointmentTime(date)).toBe(
      "Monday 17 August, 00:30",
    );
  });
});

describe("groupSlotsByDay", () => {
  it("groups slots by clinic-local day in chronological order", () => {
    const schedule = [
      {
        weekday: 1,
        startTime: "09:00",
        endTime: "10:00",
        slotMinutes: 30,
      },
      {
        weekday: 2,
        startTime: "14:00",
        endTime: "15:00",
        slotMinutes: 30,
      },
    ];

    const groups = groupSlotsByDay(
      computeFreeSlots(schedule, [], sundayEvening, 3),
    );

    expect(groups.map((group) => group.dateIso)).toEqual([
      "2026-08-17",
      "2026-08-18",
    ]);
    expect(groups[0].slots).toHaveLength(2);
    expect(groups[0].dayLabel).toBe("Monday 17 August");
  });

  it("keeps multiple slots from the same day in chronological order", () => {
    const slots = [
      {
        startsAt: clinicDateTime(monday, "10:00"),
        endsAt: clinicDateTime(monday, "10:30"),
      },
      {
        startsAt: clinicDateTime(monday, "09:00"),
        endsAt: clinicDateTime(monday, "09:30"),
      },
      {
        startsAt: clinicDateTime(monday, "09:30"),
        endsAt: clinicDateTime(monday, "10:00"),
      },
    ];

    const groups = groupSlotsByDay(slots);

    expect(groups).toHaveLength(1);
    expect(groups[0].dateIso).toBe("2026-08-17");
    expect(groups[0].slots.map((slot) => formatSlotTime(slot.startsAt))).toEqual([
      "09:00",
      "09:30",
      "10:00",
    ]);
  });

  it("returns groups in chronological order even when input slots are unsorted", () => {
    const slots = [
      {
        startsAt: clinicDateTime("2026-08-18", "14:00"),
        endsAt: clinicDateTime("2026-08-18", "14:30"),
      },
      {
        startsAt: clinicDateTime("2026-08-17", "09:00"),
        endsAt: clinicDateTime("2026-08-17", "09:30"),
      },
    ];

    const groups = groupSlotsByDay(slots);

    expect(groups.map((group) => group.dateIso)).toEqual([
      "2026-08-17",
      "2026-08-18",
    ]);
  });
});
