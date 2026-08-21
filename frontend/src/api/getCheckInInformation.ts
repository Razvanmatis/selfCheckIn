import type { GuestLookupForm } from "../types/forms";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/api/getCheckInInformation`;

export async function getCheckInInformation(form: GuestLookupForm): Promise<void> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(form)
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = "Die Check-In Instruktionen konnten nicht geladen werden.";

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

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "check_in_guestroom.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(downloadUrl);
  }
}

