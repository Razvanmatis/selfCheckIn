import { initiateCheckInProcess } from "./initiateCheckInProcess";
import type { Env } from "./env";
import {CheckInLookupPayload} from "./types/checkInLookupPayload";
import {sendErrorNotificationEmail} from "./mailService";

export async function getCheckInInformation(
    request: CheckInLookupPayload,
    env: Env
): Promise<Response | "validationError"> {

  // Erst prüfen, ob die Buchung bei Smoobu existiert.
  const checkInValidationResult = await initiateCheckInProcess(request, env);

  if (checkInValidationResult !== "OK") {
    return "validationError";
  }

  // PDF als Cloudflare Asset laden.
  const response = await env.ASSETS.fetch(
      new Request("https://assets/check_in_guestroom.pdf")
  );

  if (!response.ok) {
    await sendErrorNotificationEmail("Check-In-PDF konnte nicht geladen werden.",
        request.firstName + " " + request.lastName, request.checkInDate + "-" + request.checkOutDate, env);
    throw new Error("Check-In-PDF konnte nicht geladen werden.");
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=check_in_guestroom.pdf"
    }
  });
}