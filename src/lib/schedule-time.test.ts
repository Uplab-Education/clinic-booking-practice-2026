import { describe, expect, it } from "vitest";

import {
  clinicDateIso,
  clinicDateTime,
  clinicWeekday,
  generateSlotTimes,
} from "@/lib/availability";

describe("generateSlotTimes", () => {
  it("generates 15-minute slots", () => {
    expect(generateSlotTimes("09:00", "10:00", 15)).toEqual([
      "09:00",
      "09:15",
      "09:30",
      "09:45",
    ]);
  });

  it("generates 30-minute slots", () => {
    expect(generateSlotTimes("09:00", "11:00", 30)).toEqual([
      "09:00",
      "09:30",
      "10:00",
      "10:30",
    ]);
  });

  it("generates 60-minute slots", () => {
    expect(generateSlotTimes("09:00", "12:00", 60)).toEqual([
      "09:00",
      "10:00",
      "11:00",
    ]);
  });

  it("does not create a slot past the end of the working window", () => {
    expect(generateSlotTimes("09:00", "10:20", 30)).toEqual([
      "09:00",
      "09:30",
    ]);
  });

  it("returns no slots when the slot length is impossible", () => {
    expect(generateSlotTimes("09:00", "09:20", 30)).toEqual([]);
  });
});

describe("clinicDateTime", () => {
  it("uses the Kyiv summer UTC offset", () => {
    // Kyiv uses UTC+3 in summer, so 09:00 clinic time is 06:00 UTC.
    expect(clinicDateTime("2026-07-15", "09:00").toISOString()).toBe(
      "2026-07-15T06:00:00.000Z",
    );
  });

  it("uses the Kyiv winter UTC offset", () => {
    // Kyiv uses UTC+2 in winter, so 09:00 clinic time is 07:00 UTC.
    expect(clinicDateTime("2026-01-15", "09:00").toISOString()).toBe(
      "2026-01-15T07:00:00.000Z",
    );
  });
});

describe("clinicDateIso", () => {
  it("returns the clinic-local date when it differs from the UTC date", () => {
    const instant = new Date("2026-07-14T22:30:00.000Z");

    expect(clinicDateIso(instant)).toBe("2026-07-15");
  });
});

describe("clinicWeekday", () => {
  it("returns the clinic-local weekday when it differs from the UTC weekday", () => {
    const instant = new Date("2026-07-14T22:30:00.000Z");

    expect(clinicWeekday(instant)).toBe(3);
  });
});