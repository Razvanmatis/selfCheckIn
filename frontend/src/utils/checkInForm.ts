import type { GuestLookupForm } from "../types/forms";
import type { LoginMode } from "../types/ui";

export const initialGuestLookupForm: GuestLookupForm = {
  firstName: "",
  lastName: "",
  phone: "",
  checkInDate: "",
  checkOutDate: ""
};

function toLocalInputDate(date: Date): string {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().split("T")[0];
}

export function getDateBounds(): {
  today: string;
  maxDate: string;
  maxCheckInDate: string;
} {
  const now = new Date();
  const upperBound = new Date(now);
  const twoWeeksAhead = new Date(now);

  upperBound.setMonth(upperBound.getMonth() + 2);
  twoWeeksAhead.setDate(twoWeeksAhead.getDate() + 14);

  return {
    today: toLocalInputDate(now),
    maxDate: toLocalInputDate(upperBound),
    maxCheckInDate: toLocalInputDate(twoWeeksAhead)
  };
}

export function getMinCheckOutDate(checkInDateValue: string): string {
  if (!checkInDateValue) {
    return "";
  }

  const checkInDate = new Date(`${checkInDateValue}T00:00:00`);
  checkInDate.setDate(checkInDate.getDate() + 1);

  const localTime = new Date(checkInDate.getTime() - checkInDate.getTimezoneOffset() * 60_000);
  return localTime.toISOString().split("T")[0];
}

export function withUpdatedCheckInDate(prev: GuestLookupForm, nextCheckInDate: string): GuestLookupForm {
  if (!prev.checkOutDate || !nextCheckInDate) {
    return { ...prev, checkInDate: nextCheckInDate };
  }

  const nextMinCheckOutDate = getMinCheckOutDate(nextCheckInDate);

  return {
    ...prev,
    checkInDate: nextCheckInDate,
    checkOutDate: prev.checkOutDate >= nextMinCheckOutDate ? prev.checkOutDate : ""
  };
}

export function isFormReady(form: GuestLookupForm, loginMode: LoginMode): boolean {
  const hasName = form.firstName.trim().length > 0 && form.lastName.trim().length > 0;
  const hasPhone = form.phone.trim().length > 0;
  const hasRequiredDates = form.checkInDate.trim().length > 0 && form.checkOutDate.trim().length > 0;

  const hasIdentification = loginMode === "name" ? hasName : hasPhone;
  return hasIdentification && hasRequiredDates;
}

export function buildSubmissionForm(form: GuestLookupForm, loginMode: LoginMode): GuestLookupForm {
  if (loginMode === "phone") {
    return {
      firstName: "",
      lastName: "",
      phone: form.phone,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate
    };
  }

  return {
    firstName: form.firstName,
    lastName: form.lastName,
    phone: "",
    checkInDate: form.checkInDate,
    checkOutDate: form.checkOutDate
  };
}

