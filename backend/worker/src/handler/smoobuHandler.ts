import {EnvBoth} from "../types/envBoth";
import {getSmoobuHeaders} from "../helper/smoobuSignature";
import {SmoobuReservationsResponse} from "../types/smoobuReservationsResponse";

const smoobuSendMessageUrl = "https://login.smoobu.com/api/reservations/{reservationId}/messages/send-message-to-guest";

export async function sendMessageToGuest(reservationId: number, header: string, message: string, env: EnvBoth) {
    const url = smoobuSendMessageUrl.replace("{reservationId}", reservationId.toString());
    const body = JSON.stringify({
        subject: header,
        messageBody: `<p>${message}</p>`,
    });
    const response = await fetch(
        url,
        {
            method: "POST",
            headers: await getSmoobuHeaders(env, "POST", url, body),
            body: body,
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Smoobu Benachrichtigung eines Gasts fehlgeschlagen: ${response.status}: ${error}`);
    }
}

const smoobuReservationsUrl = "https://login.smoobu.com/api/reservations?pageSize=100";

export async function getAllBookingsBySmoobu(env: EnvBoth): Promise<SmoobuReservationsResponse> {
    const response = await fetch(smoobuReservationsUrl, {
        method: "GET",
        headers: await getSmoobuHeaders(env, "GET", smoobuReservationsUrl),
    });
    if (!response.ok) {
        const rawBody = await response.text();
        throw new Error(
            `Smoobu-Reservierungen konnten nicht geladen werden. ` +
            `HTTP ${response.status} ${response.statusText}. ` +
            `Antwort: ${rawBody || "<leer>"}`
        );
    }
    return (await response.json()) as SmoobuReservationsResponse;
}