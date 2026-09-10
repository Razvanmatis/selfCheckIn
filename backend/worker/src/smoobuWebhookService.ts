import {WebhookReservation} from "./types/webhookReservation";
import {Env} from "./env";
import {createReservation, deleteReservation, updateReservation} from "./dbService";
import {sendGeneralMessageToAdmin} from "./mailService";

export async function handleSmoobuWebhook(env: Env, requestBody: any) {
    if (!isWebhookReservation(requestBody)) {
        return;
    }
    switch (requestBody.action) {
        case "newReservation":
            if (await createReservation(env, requestBody)) {
                await sendGeneralMessageToAdmin(`Neue Reservierung von ${requestBody.data.firstname} ${requestBody.data.lastname} (${requestBody.data.phone}) für den Zeitraum ${requestBody.data.arrival} bis ${requestBody.data.departure}.`, env, false);
            }
            break;
        case "updateReservation":
            if (await updateReservation(env, requestBody)) {
                await sendGeneralMessageToAdmin(`Reservierung von ${requestBody.data.firstname} ${requestBody.data.lastname} (${requestBody.data.phone}) wurde aktualisiert. Neuer Zeitraum: ${requestBody.data.arrival} bis ${requestBody.data.departure}.`, env, false);
            }
            break;
        case "deleteReservation":
        case "cancelReservation":
            if (await deleteReservation(env, requestBody)) {
                await sendGeneralMessageToAdmin(`Reservierung von ${requestBody.data.firstname} ${requestBody.data.lastname} (${requestBody.data.phone}) für den Zeitraum ${requestBody.data.arrival} bis ${requestBody.data.departure} wurde gelöscht.`, env, false);
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