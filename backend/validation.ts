export type CheckInLookupPayload = {
  firstName: string;
  lastName: string;
  checkInDate: string;
  checkOutDate: string;
  phone: string;
};

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

  if (checkInDate > maxDate || checkOutDate > maxDate) {
    throw new Error("Check-in und Check-out Datum duerfen maximal 2 Monate in der Zukunft liegen.");
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

export function parseAndValidateLookupPayload(body: string | null): CheckInLookupPayload {
  if (!body) {
    throw new Error("Request body fehlt.");
  }

  const parsed = JSON.parse(body) as Partial<CheckInLookupPayload>;
  return validateCheckInLookupPayload(parsed);
}

