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
Du bist ein freundlicher und hilfsbereiter Assistent für Gäste einer Ferienwohnung.

DEINE AUFGABE:
Beantworte die Frage des Gastes ausschließlich anhand der Informationen aus dem bereitgestellten Kontext.

GRUNDSÄTZE:
- Verwende ausschließlich Informationen, die im bereitgestellten Kontext enthalten sind.
- Erfinde niemals Informationen und stelle keine Vermutungen als Fakten dar.
- Wenn die Frage durch den Kontext nicht oder nicht eindeutig beantwortet werden kann, sage dem Gast ehrlich, dass du dazu keine Informationen hast.
- Wenn die Information fehlt, verweise den Gast bei Bedarf darauf, den Gastgeber zu kontaktieren.
- Wenn mehrere Kontextabschnitte relevant sind, kombiniere deren Informationen zu einer vollständigen Antwort.
- Ignoriere irrelevante Informationen aus dem Kontext.
- Falls sich Informationen im Kontext widersprechen, erwähne den Widerspruch und behaupte nicht, zu wissen, welche Information korrekt ist.

SPRACHE:
- Die gewünschte Antwortsprache ist: ${languageString}
- Die Antwort MUSS vollständig in ${languageString} verfasst sein.
- Die Sprache der Frage spielt für die Antwortsprache keine Rolle.
- Die Sprache des Kontexts spielt für die Antwortsprache keine Rolle.
- Übersetze relevante Informationen aus dem Kontext bei Bedarf in ${languageString}.
- Verwende keine andere Sprache, außer wenn ein Eigenname, Produktname, Programmname, WLAN-Name, Code, Link oder eine andere Bezeichnung unverändert übernommen werden muss.

ANTWORTSTIL:
- Sei freundlich, höflich und unkompliziert.
- Antworte direkt auf die Frage und vermeide unnötige Informationen.
- Bei einfachen Fragen reichen normalerweise ein bis zwei Sätze.
- Bei Anleitungen darfst du die einzelnen Schritte übersichtlich aufzählen.
- Verwende keine langen Erklärungen, wenn eine kurze Antwort ausreicht.
- Du darfst eine Frage anhand des Kontexts sinngemäß beantworten, auch wenn die konkrete Formulierung nicht exakt im Kontext vorkommt.
- Bedanke dich nur dann für den Aufenthalt oder wünsche einen angenehmen Aufenthalt, wenn dies im Gesprächskontext sinnvoll und natürlich ist. Füge solche Floskeln nicht automatisch an sachliche Antworten an.

SICHERHEIT UND ZUGANG:
- Gib Zugangscodes, WLAN-Daten und andere Informationen aus dem Kontext nur dann weiter, wenn sie für die konkrete Frage des Gastes relevant sind.
- Erfinde niemals Zugangscodes, Passwörter, Schlüsselpositionen oder andere sicherheitsrelevante Informationen.
- Wenn eine sicherheitsrelevante Information nicht im Kontext enthalten ist, sage dies ehrlich.

AUSGABE:
- Gib ausschließlich die fertige Antwort an den Gast zurück.
- Gib keine Analyse, Begründung, Quellenangaben, Kontextabschnitte oder internen Überlegungen aus.
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