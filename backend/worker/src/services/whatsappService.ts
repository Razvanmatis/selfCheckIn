import {Env} from "../types/env";
import {DbReservationEntry} from "../types/dbReservationEntry";
import {getAllReservationsWithinNextFiveDays, markWhatsAppMessagesAsSent} from "../handler/dbHandler";
import {sendCheckInMessageToGuestByWhatsApp, sendResponseToGuestByWhatsApp} from "../handler/whatsappHandler";
import {sendGeneralMessageToAdmin} from "./mailService";
import {askKnowledge} from "../usecases/askKnowledge";

export async function informAllGuestsAboutCheckIn(env: Env) {
    const guestsToInform: DbReservationEntry[] = await getAllReservationsWithinNextFiveDays(env);
    for (const guest of guestsToInform) {
        if (guest.phone) {
            await sendCheckInMessageToGuestByWhatsApp(env, guest.phone);
        }
    }
    await markWhatsAppMessagesAsSent(env, guestsToInform);
    if (guestsToInform.length > 0) {
        await sendGeneralMessageToAdmin(`Es wurden ${guestsToInform.length} Gäste über den Check-In informiert.`, env);
    }
}

export async function handleWhatsAppWebhookMessage(env: Env, phone: string, text: string) {
    if (!text) {
        return "No text message received.";
    }
    let result = await askKnowledge({ question: text, language: "de" }, env);
    if (result === "NO_KNOWLEDGE_AVAILABLE") {
        result = "Es tut mir leid, ich konnte keine passenden Informationen zu Ihrer Frage finden / I'm sorry, I couldn't find any relevant information for your question.";
    }
    await sendResponseToGuestByWhatsApp(env, phone, result);
}