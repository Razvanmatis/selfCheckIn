import {isAdminRequest, parseAndValidateCheckInLookupPayload} from "./validation.js";
import type {Env} from "./env.js";
import {CheckInLookupPayload} from "./types/checkInLookupPayload.js";
import {sendErrorNotificationEmail} from "./mailService.js";
import {SmoobuReservationsResponse} from "./types/smoobuReservationsResponse.js";

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

export async function getAllOpenBookings(env: Env) {
  const response = await fetch(smoobuReservationsUrl, {
    method: "GET",
    headers: {
      "Api-Key": env.SMOOBU_API_KEY,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const rawBody = await response.text();
    throw new Error(
        `Smoobu-Reservierungen konnten nicht geladen werden. ` +
        `HTTP ${response.status} ${response.statusText}. ` +
        `Antwort: ${rawBody || "<leer>"}`
    );
  }

  return (await response.json()) as SmoobuReservationsResponse;
}

export async function initiateCheckInProcess(
  request: CheckInLookupPayload,
  env: Env
): Promise<string> {

  if (isAdminRequest(request, env)) {
    return "OK";
  }
  const normalizePhone = (value: string | null | undefined): string => {
    return (value ?? "").replace(/\D/g, "");
  };

  let data;
  try {
    data = await getAllOpenBookings(env);
  } catch (error) {
    await sendErrorNotificationEmail(error instanceof Error ? error.message : String(error),
        request.firstName + " " + request.lastName, `${request.checkInDate} - ${request.checkOutDate}`, env);
    throw error;
  }

  if (data.bookings.length === 0) {
    await sendErrorNotificationEmail("Keine offenen Buchungen gefunden!",
        request.firstName + " " + request.lastName, `${request.checkInDate} - ${request.checkOutDate}`, env);
    return "validationError";
  }

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
  let payload;
  try {
    payload = parseAndValidateCheckInLookupPayload(event.body);
    const result = await initiateCheckInProcess(payload, env);

    return {
      statusCode: 200,
      headers: textHeaders,
      body: result
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler im Check-In Prozess.";
    await sendErrorNotificationEmail(`Fehler im Check-In Prozess: ${message}`,
        payload?.firstName + " " + payload?.lastName, `${payload?.checkInDate} - ${payload?.checkOutDate}`, env);
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ message })
    };
  }
}

