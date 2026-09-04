import { describe, expect, it } from "vitest";

import { formatPhoneNumber } from "@/lib/phone";

describe("formatPhoneNumber", () => {
  it("formats a stored national number for the Ukrainian locale", () => {
    expect(formatPhoneNumber("0441234567")).toBe("044 123 4567");
  });

  it("formats a stored international number with its country code", () => {
    expect(formatPhoneNumber("+380441234567")).toBe("+380 44 123 4567");
  });

  it("keeps the country code of a number outside Ukraine", () => {
    expect(formatPhoneNumber("+442071234567")).toBe("+44 20 7123 4567");
  });

  it("returns the number unchanged when it cannot be parsed", () => {
    expect(formatPhoneNumber("123456789")).toBe("123456789");
  });
});
