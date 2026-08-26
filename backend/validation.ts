import type { Env } from "./env.js";
import {DefineKeypadCodeRequest} from "./types/defineKeypadCodeRequest.js";
import {CheckInLookupPayload} from "./types/checkInLookupPayload.js";
import {NukiCreateAuthPayload} from "./types/nukiCreateAuthPayload.js";

function toLocalInputDate(date: Date): string {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().split("T")[0];
}

function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function addMonths(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + amount);
  return copy;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Pflichtfeld fehlt: ${fieldName}`);
  }

  return value;
}

export function validateCheckInLookupPayload(
  payload: Partial<CheckInLookupPayload>
): CheckInLookupPayload {
  const checkInDate = requireNonEmptyString(payload.checkInDate, "checkInDate").trim();
  const checkOutDate = requireNonEmptyString(payload.checkOutDate, "checkOutDate").trim();

  if (!isIsoDate(checkInDate)) {
    throw new Error("Ungueltiges Datumsformat fuer checkInDate. Erwartet: YYYY-MM-DD.");
  }

  if (!isIsoDate(checkOutDate)) {
    throw new Error("Ungueltiges Datumsformat fuer checkOutDate. Erwartet: YYYY-MM-DD.");
  }

  const today = new Date();
  const todayDate = toLocalInputDate(today);
  const maxDate = toLocalInputDate(addMonths(today, 2));
  const maxCheckInDate = toLocalInputDate(addDays(today, 14));
  const minCheckOutDate = toLocalInputDate(addDays(new Date(`${checkInDate}T00:00:00`), 1));

  if (checkInDate < todayDate) {
    throw new Error("Das Check-in Datum darf nicht in der Vergangenheit liegen.");
  }

  if (checkInDate > maxCheckInDate) {
    throw new Error("Das Check-in Datum darf maximal 2 Wochen in der Zukunft liegen.");
  }

  if (checkOutDate > maxDate) {
    throw new Error("Check-out Datum darf maximal 2 Monate in der Zukunft liegen.");
  }

  if (checkOutDate < minCheckOutDate) {
    throw new Error("Das Check-out Datum muss mindestens 1 Tag nach dem Check-in Datum liegen.");
  }

  const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

  const hasName = firstName.length > 0 && lastName.length > 0;
  const hasPhone = phone.length > 0;

  if (!hasName && !hasPhone) {
    throw new Error("Entweder Name (Vorname + Nachname) oder Telefonnummer erforderlich.");
  }

  return {
    firstName,
    lastName,
    phone,
    checkInDate,
    checkOutDate
  };
}

export function parseAndValidateCheckInLookupPayload(body: string | null): CheckInLookupPayload {
  if (!body) {
    throw new Error("Request body fehlt.");
  }

  const parsed = JSON.parse(body) as Partial<CheckInLookupPayload>;
  return validateCheckInLookupPayload(parsed);
}

export function isAdminRequest(request: CheckInLookupPayload, env: Env) {
  return request.firstName === env.ADMIN_NAME && request.lastName === env.ADMIN_NAME;
}

export function parseAndValidateDefineKeypadCodeRequest(body: string | null): DefineKeypadCodeRequest {
  if (!body) {
    throw new Error("Request body fehlt.");
  }

  const parsed = JSON.parse(body) as Partial<DefineKeypadCodeRequest>;

  const validatedLookup = validateCheckInLookupPayload(parsed);

  if (!parsed.pinCode || parsed.pinCode.trim().length === 0) {
    throw new Error("Pflichtfeld fehlt: pinCode");
  }
  if (!isCodeValid(parsed as DefineKeypadCodeRequest)) {
    throw new Error("Ungültiger pinCode. Er muss 6-stellig sein, darf keine '0' enthalten und darf nicht mit '12' beginnen.");
  }

  return {
    firstName: validatedLookup.firstName,
    lastName: validatedLookup.lastName,
    phone: validatedLookup.phone,
    checkInDate: validatedLookup.checkInDate,
    checkOutDate: validatedLookup.checkOutDate,
    pinCode: parsed.pinCode.trim()
  };
}

export function isCodeValid(payload: DefineKeypadCodeRequest): boolean {
  if (!/^\d{6}$/.test(payload.pinCode)) {
    return false;
  }

  if (payload.pinCode.includes("0")) {
    return false;
  }

  return !payload.pinCode.startsWith("12");
}

export function normalizeDateString(value: string): string {
  const trimmed = value.trim();

  if (/^\d{4}[-.]\d{2}[-.]\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Ungueltiges Datumsformat: ${value}`);
  }

  return parsed.toISOString();
}

export function getDateOnly(value: string): string {
  return normalizeDateString(value).slice(0, 10);
}

export function getOlderDate(referenceDate: string, comparisonDate?: string): string {
  if (!comparisonDate) {
    return referenceDate;
  }

  return new Date(normalizeDateString(referenceDate)).getTime() <= new Date(normalizeDateString(comparisonDate)).getTime()
      ? referenceDate
      : comparisonDate;
}

export function getNewerDate(referenceDate: string, comparisonDate?: string): string {
  if (!comparisonDate) {
    return referenceDate;
  }

  return new Date(normalizeDateString(referenceDate)).getTime() >= new Date(normalizeDateString(comparisonDate)).getTime()
      ? referenceDate
      : comparisonDate;
}

export function formatDateToDayMonth(value: string): string {
  // Erlaubt z. B. 2026-08-21, 2026.08.21 oder ISO-Strings mit Uhrzeit
  const datePart = getDateOnly(value);
  const match = datePart.match(/^(\d{4})[-.](\d{2})[-.](\d{2})$/);
  if (!match) {
    throw new Error(`Ungueltiges Datumsformat: ${value}`);
  }

  const [, , month, day] = match;
  return `${day}.${month}`;
}

export function getFormattedDateAsName(checkInDate: string, checkOutDate: string): string {
  return `${formatDateToDayMonth(checkInDate)} - ${formatDateToDayMonth(checkOutDate)}`;
}

export function buildNukiCreatePayload(payload: DefineKeypadCodeRequest,
                                env: Env): NukiCreateAuthPayload {
  return {
    name: getFormattedDateAsName(payload.checkInDate, payload.checkOutDate),
    allowedFromDate: `${payload.checkInDate}T13:00:00.000Z`,
    allowedUntilDate: `${payload.checkOutDate}T09:00:00.000Z`,
    allowedWeekDays: 127,
    allowedFromTime: 0,
    allowedUntilTime: 0,
    accountUserId: 0,
    smartlockIds: [Number(env.NUKI_SMARTLOCK_ID)],
    remoteAllowed: true,
    smartActionsEnabled: true,
    type: 13,
    code: Number(payload.pinCode)
  };
}