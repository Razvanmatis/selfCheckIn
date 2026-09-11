import {isAdminRequest, parseAndValidateCheckInLookupPayload} from "./helper/validation.js";
import {CheckInLookupPayload} from "./types/checkInLookupPayload.js";
import {sendErrorNotificationEmail} from "./services/mailService.js";
import {getAllBookingsBySmoobu} from "./handler/smoobuHandler";
import {EnvBoth} from "./types/envBoth";
import {getAllReservationsFromDb} from "./handler/dbHandler";
import {Env} from "./types/env";
import {SmoobuReservationsResponse} from "./types/smoobuReservationsResponse";
import {checkForBookingMatchByNameOrPhone} from "./helper/validation.js";

export async function getAllOpenBookings(env: EnvBoth): Promise<SmoobuReservationsResponse> {
  try {
    const result = await getAllBookingsBySmoobu(env);
    if (!result || !result.bookings || result.bookings.length === 0) {
      throw new Error("Keine offenen Buchungen gefunden!");
    }
    return result;
  } catch (error) {
    return await getAllReservationsFromDb(env as Env);
  }
}

export async function initiateCheckInProcess(
  request: CheckInLookupPayload,
  env: EnvBoth | Env,
): Promise<string> {
  if (isAdminRequest(request, env)) {
    return "OK";
  }
  let data;
  try {
    data = await getAllOpenBookings(env as Env);
  } catch (error) {
    await sendErrorNotificationEmail(error instanceof Error ? error.message : String(error),
        request.firstName + " " + request.lastName, `${request.checkInDate} - ${request.checkOutDate}`, env);
    throw error;
  }
  if (!data || !data.bookings || data.bookings.length === 0) {
    await sendErrorNotificationEmail("Keine offenen Buchungen gefunden!",
        request.firstName + " " + request.lastName, `${request.checkInDate} - ${request.checkOutDate}`, env);
    return "validationError";
  }
  return checkForBookingMatchByNameOrPhone(request, data) ? "OK" : "validationError";
}

type LambdaLikeEvent = {
  body: string | null;
};

type LambdaLikeResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

export async function handler(event: LambdaLikeEvent,
                              env: EnvBoth): Promise<LambdaLikeResponse> {
  const jsonHeaders = {
    "Content-Type": "application/json"
  };
  const textHeaders = {
    "Content-Type": "text/plain; charset=utf-8"
  };
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

