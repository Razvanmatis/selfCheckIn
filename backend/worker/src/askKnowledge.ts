import type { Env } from "./env";

export async function askKnowledge(
    question: string,
    env: Env
): Promise<string> {
    // 1. Frage in einen Vektor umwandeln
    const embedding = await env.AI.run(
        "@cf/qwen/qwen3-embedding-0.6b",
        {
            text: [question]
        }
    );

    if (!embedding.data || embedding.data.length === 0) {
        throw new Error(
            "Kein Embedding für die Frage erhalten."
        );
    }

    // 2. Vectorize nach passenden Informationen durchsuchen
    const results = await env.APARTMENT_KNOWLEDGE.query(
        embedding.data[0],
        {
            topK: 3,
            returnMetadata: "all"
        }
    );

    if (!results.matches || results.matches.length === 0) {
        return "Dazu habe ich leider keine Informationen.";
    }

    // 3. Gefundene Informationen als Kontext zusammenbauen
    const context = results.matches
        .map((match) => {
            const metadata = match.metadata as {
                text?: string;
                language?: string;
            };

            return metadata.text ?? "";
        })
        .filter(Boolean)
        .join("\n\n");

    // 4. LLM mit Frage + Kontext aufrufen
    const response = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
            messages: [
                {
                    role: "system",
                    content:
                        "Du bist ein freundlicher Assistent für Gäste einer Ferienwohnung. " +
                        "Beantworte Fragen ausschließlich anhand der bereitgestellten Informationen. " +
                        "Wenn die Informationen keine Antwort enthalten, sage ehrlich, dass du es nicht weißt. " +
                        "Erfinde niemals Informationen."
                },
                {
                    role: "user",
                    content:
                        `Informationen zur Wohnung:\n\n${context}\n\n` +
                        `Frage des Gastes:\n${question}`
                }
            ]
        }
    );
    if (typeof response.response !== "string") {
        throw new Error(
            "Das LLM hat keine gültige Textantwort zurückgegeben."
        );
    }
    return response.response;
}