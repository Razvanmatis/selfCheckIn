import {
  parseAndValidateLookupPayload,
  type CheckInLookupPayload
} from "./validation.js";
import type { Env } from "./env.js";

type SmoobuBooking = {
  id: number;
  firstname: string;
  lastname: string;
  arrival: string;
  departure: string;
  phone: string | null;
};

type SmoobuReservationsResponse = {
  page_count: number;
  page_size: number;
  total_items: number;
  page: number;
  bookings: SmoobuBooking[];
};

type LambdaLikeEvent = {
  body: string | null;
};

type LambdaLikeResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const jsonHeaders = {
  "Content-Type": "application/json"
};

const textHeaders = {
  "Content-Type": "text/plain; charset=utf-8"
};

const smoobuReservationsUrl = "https://login.smoobu.com/api/reservations?pageSize=100";

export async function initiateCheckInProcess(
  request: CheckInLookupPayload,
  env: Env
): Promise<string> {
  const normalizePhone = (value: string | null | undefined): string => {
    return (value ?? "").replace(/\D/g, "");
  };

  const response = await fetch(smoobuReservationsUrl, {
    method: "GET",
    headers: {
      "Api-Key": env.SMOOBU_API_KEY,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Smoobu-Reservierungen konnten nicht geladen werden.");
  }

  const data = (await response.json()) as SmoobuReservationsResponse;

  // Determine search mode: by name or by phone
  const hasName = request.firstName.trim().length && request.lastName.trim().length;
  const hasPhone = request.phone.trim().length;

  let matchingBooking;

  if (hasName) {
    // Search by name
    const normalizedFirstName = request.firstName.trim().toLowerCase();
    const normalizedLastName = request.lastName.trim().toLowerCase();

    matchingBooking = data.bookings.find((booking) => {
      return (
        booking.firstname.trim().toLowerCase() === normalizedFirstName &&
        booking.lastname.trim().toLowerCase() === normalizedLastName &&
        booking.arrival === request.checkInDate &&
        booking.departure === request.checkOutDate
      );
    });
  } else if (hasPhone) {
    // Search by phone number - normalize by keeping only digits
    const normalizedPhone = normalizePhone(request.phone);

    matchingBooking = data.bookings.find((booking) => {
      const bookingPhone = normalizePhone(booking.phone);
      return (
        bookingPhone === normalizedPhone &&
        booking.arrival === request.checkInDate &&
        booking.departure === request.checkOutDate
      );
    });
  }

  return matchingBooking ? "OK" : "validationError";
}

export async function handler(event: LambdaLikeEvent,
                              env: Env): Promise<LambdaLikeResponse> {
  try {
    const payload = parseAndValidateLookupPayload(event.body);
    const result = await initiateCheckInProcess(payload, env);

    return {
      statusCode: 200,
      headers: textHeaders,
      body: result
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler im Check-In Prozess.";
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ message })
    };
  }
}

