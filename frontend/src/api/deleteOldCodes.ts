const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/api/deleteOldCodes`;

export async function deleteOldCodes(payload: string): Promise<string> {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ adminUser: payload })
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

    const responseText = (await response.text()).trim();

    try {
        const parsed = JSON.parse(responseText) as {
            message?: string;
            answer?: { body?: string };
        };

        const nestedAnswerBody = parsed.answer?.body;
        if (typeof nestedAnswerBody === "string" && nestedAnswerBody.trim()) {
            try {
                const nested = JSON.parse(nestedAnswerBody) as { message?: string };
                if (typeof nested.message === "string" && nested.message.trim()) {
                    return nested.message.trim();
                }
            } catch {
                return nestedAnswerBody.trim();
            }
        }

        if (typeof parsed.message === "string" && parsed.message.trim()) {
            return parsed.message.trim();
        }
    } catch {
        // Keep plain text responses unchanged.
    }

    return responseText;
}