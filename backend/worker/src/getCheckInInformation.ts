import { initiateCheckInProcess } from "./initiateCheckInProcess";
import type { CheckInLookupPayload } from "./validation";
import type { Env } from "./env";

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