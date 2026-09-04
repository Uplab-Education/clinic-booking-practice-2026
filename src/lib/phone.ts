import { parsePhoneNumberFromString } from "libphonenumber-js";

export function formatPhoneNumber(phone: string) {
  const parsed = parsePhoneNumberFromString(phone, "UA");

  if (!parsed) {
    return phone;
  }

  return phone.startsWith("+")
    ? parsed.formatInternational()
    : parsed.formatNational();
}