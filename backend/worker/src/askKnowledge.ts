import type {Env} from "./env";

type AskKnowledgeRequest = { question: string; language?: string; };

function getLanguageString(language: string | undefined): string {
    switch (language?.trim().toLowerCase()) {
        case "de":
            return "Deutsch";
        case "en":
            return "Englisch";
        case "ru":
            return "Russisch";
        case "zh":
            return "Chinesisch";
        case "hi":
            return "Hindi";
        case "it":
            return "Italienisch";
        case "es":
            return "Spanisch";
        case "el":
            return "Griechisch";
        case "pt":
            return "Portugiesisch";
        case "ja":
            return "Japanisch";
        case "th":
            return "Thailändisch";
        case "vi":
            return "Vietnamesisch";
        case "cs":
            return "Tschechisch";
        case "pl":
            return "Polnisch";
        case "ro":
            return "Rumänisch";
        case "sr":
            return "Serbisch";
        case "fr":
            return "Französisch";
        default:
            return "Deutsch";
    }
}

export async function askKnowledge(
    payload: AskKnowledgeRequest,
    env: Env
): Promise<string> {
    console.log("sprache: " + getLanguageString(payload.language));
    const languageString = getLanguageString(payload.language);
    // 1. Frage in einen Vektor umwandeln
    const embedding = await env.AI.run(
        "@cf/qwen/qwen3-embedding-0.6b",
        {
            text: [payload.question]
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
    const content = `
Du bist ein Assistent für Gäste einer Ferienwohnung.

DEINE AUFGABE:
Beantworte die Frage des Gastes ausschließlich anhand des bereitgestellten Kontexts.

WICHTIGE REGELN:
- Erfinde keine Informationen.
- Wenn der Kontext die Frage nicht beantwortet, sage dies ehrlich.
- Die gewünschte Antwortsprache ist: ${languageString}
- Die Antwort MUSS vollständig in ${languageString} sein.
- Die Sprache der Frage spielt für die Antwortsprache keine Rolle.
- Die Sprache des Kontexts spielt für die Antwortsprache keine Rolle.
- Wenn Frage und Kontext auf Deutsch sind, antworte trotzdem auf ${languageString}.
- Gib ausschließlich die Antwort an den Gast zurück.
`;
    // 4. LLM mit Frage + Kontext aufrufen
    const response = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
            messages: [
                {
                    role: "system",
                    content: content
                },
                {
                    role: "user",
                    content:
                        `Informationen zur Wohnung:\n\n${context}\n\n` +
                        `Frage des Gastes:\n${payload.question}`
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