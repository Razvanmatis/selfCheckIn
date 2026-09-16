import {sendGeneralMessageToAdmin} from "./mailService";
import {informAllGuestsAboutCheckIn} from "./whatsappService";
import {deleteOldCodesHandler} from "../deleteOldCodes";
import {deleteExpiredReservations} from "../handler/dbHandler";
import {Env} from "../types/env";

export async function runScheduledTasks(env: Env) {
    try {
        console.log("Daily deleteExpiredReservations job gestartet.");
        await deleteExpiredReservations(env);
        console.log("Daily deleteExpiredReservations job erfolgreich abgeschlossen.");
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Löschen alter Reservierungen.";
        console.error(
            `Fehler im Daily deleteExpiredReservations Job: ${message}`
        );
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Löschen alter Reservierungen: ${message}`,
            env
        );
    }
    try {
        console.log("Daily deleteOldCodesHandler job gestartet.");
        await deleteOldCodesHandler(
            { body: env.ADMIN_NAME },
            env
        );
        console.log("Daily deleteOldCodesHandler job erfolgreich abgeschlossen.");
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim täglichen Löschen alter Codes.";
        console.error(
            `Fehler im Daily deleteOldCodesHandler Job: ${message}`
        );
        await sendGeneralMessageToAdmin(
            `Fehler im täglichen Löschen alter Codes: ${message}`,
            env
        );
    }
    try {
        console.log("Daily informAllGuestsAboutCheckIn job gestartet.");
        await informAllGuestsAboutCheckIn(env);
        console.log("Daily informAllGuestsAboutCheckIn job erfolgreich abgeschlossen.");
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unbekannter Fehler beim Informieren der Gäste über den Check-In.";
        console.error(
            `Fehler im Daily informAllGuestsAboutCheckIn Job: ${message}`
        );
        await sendGeneralMessageToAdmin(
            `Fehler beim täglichen Informieren der Gäste über den Check-In: ${message}`,
            env
        );
    }
}