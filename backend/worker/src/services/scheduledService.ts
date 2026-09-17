import {sendGeneralMessageToAdmin} from "./mailService";
import {informAllGuestsAboutCheckIn} from "./whatsappService";
import {deleteOldCodesHandler} from "../usecases/deleteOldNukiCodes";
import {deleteExpiredReservations} from "../handler/dbHandler";
import {Env} from "../types/env";

export async function runScheduledTasks(env: Env) {
    try {
        await deleteExpiredReservations(env);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Löschen alter Reservierungen.";
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Löschen alter Reservierungen: ${message}`,
            env
        );
    }
    try {
        await deleteOldCodesHandler(
            { body: env.ADMIN_NAME },
            env
        );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim täglichen Löschen alter Codes.";
        await sendGeneralMessageToAdmin(
            `Fehler im täglichen Löschen alter Codes: ${message}`,
            env
        );
    }
    try {
        await informAllGuestsAboutCheckIn(env);
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Informieren der Gäste über den Check-In.";
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Informieren der Gäste über den Check-In: ${message}`,
            env
        );
    }
}