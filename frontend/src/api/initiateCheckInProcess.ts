import type { GuestLookupForm } from "../types/forms";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/api/initiateCheckInProcess`;

export async function initiateCheckInProcess(
  form: GuestLookupForm
): Promise<string> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(form)
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = "Der Check-In Prozess konnte nicht gestartet werden.";

    if (errorText) {
      try {
        const parsed = JSON.parse(errorText) as { message?: string };
        errorMessage = parsed.message?.trim() || errorText;
      } catch {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  return (await response.text()).trim();
}


