import {WebhookReservation} from "../types/webhookReservation";
import {Env} from "../types/env";
import {createReservation, deleteReservation, updateReservation} from "../handler/dbHandler";
import {sendGeneralMessageToAdmin} from "./mailService";

export async function handleSmoobuWebhook(env: Env, requestBody: any) {
    if (!isWebhookReservation(requestBody)) {
        return;
    }
    switch (requestBody.action) {
        case "newReservation":
            try {
                await createReservation(env, requestBody);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unbekannter Fehler beim Erstellen der Reservierung.";
                await sendGeneralMessageToAdmin(
                    `Fehler beim Erstellen der Reservierung: ${message}`,
                    env
                );
            }
            break;
        case "updateReservation":
            try {
                await updateReservation(env, requestBody);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unbekannter Fehler beim Aktualisieren der Reservierung.";
                await sendGeneralMessageToAdmin(
                    `Fehler beim Aktualisieren der Reservierung: ${message}`,
                    env
                );
            }
            break;
        case "deleteReservation":
        case "cancelReservation":
            try {
                await deleteReservation(env, requestBody);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Unbekannter Fehler beim Löschen der Reservierung.";
                await sendGeneralMessageToAdmin(
                    `Fehler beim Löschen der Reservierung: ${message}`,
                    env
                );
            }
            break;
        default:
            // ignore per default
            break;
    }
}

function isWebhookReservation(value: unknown): value is WebhookReservation {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const webhook = value as Record<string, unknown>;
    if (
        webhook.action !== "newReservation" &&
        webhook.action !== "updateReservation" &&
        webhook.action !== "cancelReservation" &&
        webhook.action !== "deleteReservation"
    ) {
        return false;
    }
    if (typeof webhook.data !== "object" || webhook.data === null) {
        return false;
    }
    const data = webhook.data as Record<string, unknown>;
    return (
        typeof data.id === "number" &&
        typeof data.arrival === "string" &&
        typeof data.departure === "string" &&
        typeof data.firstname === "string" &&
        typeof data.lastname === "string" &&
        (typeof data.phone === "string" || data.phone === null)
    );
}