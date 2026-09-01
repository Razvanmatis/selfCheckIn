const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/api/deleteOldCodes`;

export async function deleteOldCodes(payload: string): Promise<string> {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();

        let errorMessage = "Die alten Codes konnten nicht gelöscht werden.";

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