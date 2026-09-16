import { Env } from "../types/env";
import {askKnowledge} from "../askKnowledge";
import {sendResponseToGuestByWhatsApp} from "../handler/whatsappHandler";

export async function handleWhatsAppWebhookMessage(env: Env, phone: string, text: string) {
    if (!text) {
        return "No text message received.";
    }
    let result = await askKnowledge({ question: text, language: "de" }, env);
    if (result === "NO_KNOWLEDGE_AVAILABLE") {
        result = "Es tut mir leid, ich konnte keine passenden Informationen zu Ihrer Frage finden";
    }
    await sendResponseToGuestByWhatsApp(env, phone, result);
}