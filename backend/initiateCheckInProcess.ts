import {CheckInLookupPayload} from "./types/checkInLookupPayload.js";
import {SmoobuReservationsResponse} from "./types/smoobuReservationsResponse.js";
import {EnvBoth} from "./worker/src/envBoth.js";
import {getSmoobuHeaders} from "./worker/src/smoobuSignature.js";
import {isAdminRequest, normalizePhone, parseAndValidateCheckInLookupPayload} from "./worker/src/validation.js";
import {sendErrorNotificationEmail} from "./worker/src/mailService.js";

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

const smoobuReservationsUrl =
    "https://login.smoobu.com/api/reservations?pageSize=100";

const smoobuSendMessageUrl = "https://login.smoobu.com/api/reservations/{reservationId}/messages/send-message-to-guest";

export async function getAllOpenBookings_with_legacy_token(env: EnvBoth) {
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

export async function sendMessageToGuest(reservationId: number, header: string, message: string, env: EnvBoth) {
  const url = smoobuSendMessageUrl.replace("{reservationId}", reservationId.toString());
  const body = JSON.stringify({
    subject: header,
    messageBody: `<p>${message}</p>`,
  });
  const response = await fetch(
      url,
      {
        method: "POST",
        headers: await getSmoobuHeaders(env, "POST", url, body),
        body: body,
      }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Smoobu Benachrichtigung eines Gasts fehlgeschlagen: ${response.status}: ${error}`);
  }
}

export async function getAllOpenBookings(env: EnvBoth) {
  const response = await fetch(smoobuReservationsUrl, {
    method: "GET",
    headers: await getSmoobuHeaders(env, "GET", smoobuReservationsUrl),
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
  env: EnvBoth
): Promise<string> {

  if (isAdminRequest(request, env)) {
    return "OK";
  }

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
                              env: EnvBoth): Promise<LambdaLikeResponse> {
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

