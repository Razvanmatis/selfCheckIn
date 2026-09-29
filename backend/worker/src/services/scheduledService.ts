import {sendGeneralMessageToAdmin} from "./mailService";
import {informAllGuestsAboutCheckIn} from "./whatsappService";
import {deleteAllOldCodes, deleteOldCodesHandler} from "../usecases/deleteOldNukiCodes";
import {deleteAllWhatsAppMessagesWhichAreOlderThan3Days, deleteExpiredReservations} from "../handler/dbHandler";
import {Env} from "../types/env";

export async function runScheduledTasks(env: Env): Promise<string> {
    let answer = "";
    try {
        answer += await deleteExpiredReservations(env);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Löschen alter Reservierungen.";
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Löschen alter Reservierungen: ${message}`,
            env
        );
        answer += `Fehler beim Löschen alter Reservierungen: ${message}\n`;
    }
    try {
        answer += await deleteAllOldCodes(env)
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim täglichen Löschen alter Codes.";
        await sendGeneralMessageToAdmin(
            `Fehler im täglichen Löschen alter Codes: ${message}`,
            env
        );
        answer += `Fehler beim Löschen alter Codes: ${message}\n`;
    }
    try {
        answer += await informAllGuestsAboutCheckIn(env);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Informieren der Gäste über den Check-In.";
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Informieren der Gäste über den Check-In: ${message}`,
            env
        );
        answer += `Fehler beim Informieren der Gäste über den Check-In: ${message}\n`;
    }
    try {
        answer += await deleteAllWhatsAppMessagesWhichAreOlderThan3Days(env);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Löschen alter WhatsApp-Nachrichten.";
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Löschen alter WhatsApp-Nachrichten: ${message}`,
            env
        );
        answer += `Fehler beim Löschen alter WhatsApp-Nachrichten: ${message}\n`;
    }
    return answer;
}