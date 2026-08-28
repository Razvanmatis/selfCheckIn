type AskKnowledgeRequest = { question: string; };
type AskKnowledgeResponse = { answer: string; };

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const endpoint = `${apiBaseUrl}/api/ai/ask`;

export async function askKnowledge(payload: AskKnowledgeRequest): Promise<string> {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Die Anfrage an den AI-Assistenten ist fehlgeschlagen.";
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
    const data = (await response.json()) as AskKnowledgeResponse;
    return data.answer.trim();
}