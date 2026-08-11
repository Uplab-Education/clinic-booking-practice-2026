import { describe, expect, it } from "vitest";
import {
  clinicDateTime,
  computeFreeSlots,
  generateSlotTimes,
  groupSlotsByDay,
} from "./availability";

// 2026-08-17 is a Monday.
const monday = "2026-08-17";
const mondaySchedule = [{ weekday: 1, startTime: "09:00", endTime: "11:00", slotMinutes: 30 }];
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
    expect(generateSlotTimes("09:00", "10:45", 30)).toEqual(["09:00", "09:30", "10:00"]);
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
    const slots = computeFreeSlots(mondaySchedule, booked, sundayEvening, 2);

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

describe("groupSlotsByDay", () => {
  it("groups slots by clinic-local day in chronological order", () => {
    const schedule = [
      { weekday: 1, startTime: "09:00", endTime: "10:00", slotMinutes: 30 },
      { weekday: 2, startTime: "14:00", endTime: "15:00", slotMinutes: 30 },
    ];
    const groups = groupSlotsByDay(computeFreeSlots(schedule, [], sundayEvening, 3));

    expect(groups.map((group) => group.dateIso)).toEqual(["2026-08-17", "2026-08-18"]);
    expect(groups[0].slots).toHaveLength(2);
    expect(groups[0].dayLabel).toContain("Monday");
  });
});
