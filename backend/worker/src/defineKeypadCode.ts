import {getAllOpenBookings, initiateCheckInProcess} from "./initiateCheckInProcess.js";
import {
    buildNukiCreatePayload,
    getExistingNameInitialsOfNukiAuthEntry,
    getFormattedDateAsName,
    getNewerDate,
    getOlderDate,
    isAdminRequest,
    parseAndValidateDefineKeypadCodeRequest,
} from "./validation.js";
import type {Env} from "./env.js";
import {NukiAuthEntry} from "./types/nukiAuthEntry.js";
import {NukiCreateAuthPayload} from "./types/nukiCreateAuthPayload.js";
import {DefineKeypadCodeRequest} from "./types/defineKeypadCodeRequest.js";
import {sendBookingConfirmationEmail, sendErrorNotificationEmail} from "./mailService.js";
import {SmoobuReservationsResponse} from "./types/smoobuReservationsResponse.js";

type LambdaLikeEvent = {
    body: string | null;
};

type LambdaLikeResponse = {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
};

const jsonHeaders = {
    "Content-Type": "application/json"
};

const textHeaders = {
    "Content-Type": "text/plain; charset=utf-8"
};

const retryDelayMs = 3000;
const nukiBaseUrl = "https://api.nuki.io";

async function wait(ms: number): Promise<void> {
    const start = Date.now();
    let remaining = ms;

    // Enforce a minimum wait duration even with timer jitter.
    while (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
        remaining = ms - (Date.now() - start);
    }
}

async function forceNukiSync(env: Env): Promise<void> {
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await fetch(`${nukiBaseUrl}/smartlock/${env.NUKI_SMARTLOCK_ID}/sync`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.NUKI_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Nuki-Sync konnte nicht gestartet werden.");
        }

        if (attempt < 5) {
            await wait(retryDelayMs);
        }
    }
}

async function getAllKeypadCodes(env: Env): Promise<NukiAuthEntry[]> {
    const response = await fetch(
        `${nukiBaseUrl}/smartlock/${env.NUKI_SMARTLOCK_ID}/auth?types=13`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${env.NUKI_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.ok) {
        throw new Error("Nuki-Keypad Eintraege konnten nicht geladen werden.");
    }

    return (await response.json()) as NukiAuthEntry[];
}

async function deleteKeypadCode(entryId: string, env: Env): Promise<void> {
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await fetch(`${nukiBaseUrl}/smartlock/${env.NUKI_SMARTLOCK_ID}/auth/${entryId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${env.NUKI_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 423) {
            if (attempt >= 1) {
                return;
            }
        } else if (![200, 204, 404].includes(response.status)) {
            throw new Error("Bestehender Nuki-Code konnte nicht entfernt werden. ID: " + entryId);
        }

        if (attempt < 5) {
            await wait(retryDelayMs);
        }
    }
}

async function createKeypadCode(payload: NukiCreateAuthPayload, env: Env): Promise<void> {
    const expectedCode = String(payload.code);
    const expectedName = payload.name;

    for (let attempt = 0; attempt < 6; attempt += 1) {
        const response = await fetch(`${nukiBaseUrl}/smartlock/auth`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${env.NUKI_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 409) {
            if (attempt > 1) {
                await forceNukiSync(env);
                const entries = await getAllKeypadCodes(env);
                const alreadyPresent = entries.some(
                    (entry) => String(entry.code) === expectedCode && entry.name === expectedName
                );

                if (alreadyPresent) {
                    console.log("Nuki-Code bereits vorhanden, keine weiteren Versuche.");
                    return;
                }
            }
        } else if (!response.ok) {
            console.log(`Fehler beim Setzen des Nuki-Codes: ${response.status} ${response.statusText}`);
            throw new Error("Neuer Nuki-Keypad Code konnte nicht gesetzt werden. Code: " + expectedCode + ", Name: " + expectedName);
        }

        if (attempt < 5) {
            await wait(retryDelayMs);
            console.log("Erneuter Versuch, Nuki-Code zu setzen..." + ` (Versuch ${attempt + 2} von 6)`);
        }
    }
}

async function handleDeletionOfEntries(existingEntriesToDelete: NukiAuthEntry[], env: Env) {
    for (const entry of existingEntriesToDelete) {
        await deleteKeypadCode(entry.id, env);
        console.log(`Nuki-Code ${entry.code} entfernt: ${entry.name}`);
    }

    await forceNukiSync(env);
    console.log("Nuki-Sync erfolgreich durchgeführt.");
}

function getMatchedBookingOfList(allBookings: SmoobuReservationsResponse, request: DefineKeypadCodeRequest) {
    return allBookings?.bookings.find((booking) => {
        return (
            booking.arrival === request.checkInDate &&
            booking.departure === request.checkOutDate &&
            (booking.firstname.trim().toLowerCase() === request.firstName.trim().toLowerCase() &&
                booking.lastname.trim().toLowerCase() === request.lastName.trim().toLowerCase() ||
                booking.phone?.trim() === request.phone.trim())
        );
    });
}

async function getNameInitialsOfRequest(request: DefineKeypadCodeRequest, allBookings: SmoobuReservationsResponse, env: Env) {
    const hasName = request.firstName.trim().length && request.lastName.trim().length;
    let nameCharacters = "";
    if (hasName) {
        nameCharacters = `${request.firstName.trim().charAt(0).toUpperCase()}${request.lastName.trim().charAt(0).toUpperCase()}`;
    } else {
        const bookingMatch = getMatchedBookingOfList(allBookings, request);
        if (bookingMatch) {
            nameCharacters = `${bookingMatch.firstname.trim().charAt(0).toUpperCase()}${bookingMatch.lastname.trim().charAt(0).toUpperCase()}`;
        } else {
            console.log("Keine Buchung gefunden, um Initialen zu ermitteln.");
            await sendErrorNotificationEmail(`Keine Buchung gefunden, um Initialen zu ermitteln. Ankunft: ${request.checkInDate},
             Abreise: ${request.checkOutDate}`, request.firstName + " " + request.lastName,
                `${request.checkInDate} - ${request.checkOutDate}`, env, request.pinCode);
            nameCharacters = "XX";
        }
    }
    return nameCharacters;
}

async function getMailOfGuest(request: DefineKeypadCodeRequest, allBookings: SmoobuReservationsResponse, env: Env) {
    if (isAdminRequest(request, env)) {
        return env.EMAIL_FROM;
    }
    const bookingMatch = getMatchedBookingOfList(allBookings, request);
    if (bookingMatch === undefined) {
        console.log("Keine Buchung gefunden, um E-Mail-Adresse zu ermitteln.");
        await sendErrorNotificationEmail(`Keine Buchung gefunden, um E-Mail-Adresse zu ermitteln. Ankunft: ${request.checkInDate},
             Abreise: ${request.checkOutDate}`, request.firstName + " " + request.lastName,
            `${request.checkInDate} - ${request.checkOutDate}`, env, request.pinCode);
    }
    return bookingMatch?.email ?? "";
}

async function getGuestName(request: DefineKeypadCodeRequest, allBookings: SmoobuReservationsResponse, env: Env) {
    if (isAdminRequest(request, env)) {
        return env.ADMIN_NAME;
    }
    if (request.firstName.trim().length > 0 && request.lastName.trim().length > 0) {
        return `${request.firstName.trim()} ${request.lastName.trim()}`;
    }
    const bookingMatch = getMatchedBookingOfList(allBookings, request);
    if (bookingMatch === undefined) {
        console.log("Keine Buchung gefunden, um Namen zu ermitteln.");
        await sendErrorNotificationEmail(`Keine Buchung gefunden, um Namen zu ermitteln. Ankunft: ${request.checkInDate},
             Abreise: ${request.checkOutDate}`, request.firstName + " " + request.lastName,
            `${request.checkInDate} - ${request.checkOutDate}`, env, request.pinCode);
    }
    return bookingMatch ? `${bookingMatch.firstname} ${bookingMatch.lastname}` : "NAME_NOT_FOUND";
}

async function sendConfirmationMail(request: DefineKeypadCodeRequest, allBookings: SmoobuReservationsResponse, env: Env, formattedDateAsName: string) {
    const guestMail = await getMailOfGuest(request, allBookings, env);
    const guestName = await getGuestName(request, allBookings, env);
    await sendBookingConfirmationEmail(
        guestMail,
        guestName,
        formattedDateAsName,
        request.pinCode,
        env,
        request.language
    );
}

export async function defineKeypadCode(request: DefineKeypadCodeRequest,
                                       env: Env): Promise<string> {
    const checkInValidationResult = await initiateCheckInProcess(request, env);

    if (checkInValidationResult !== "OK") {
        return "validationError";
    }

    await forceNukiSync(env);
    console.log("Nuki-Sync erfolgreich durchgeführt.");

    const allCurrentKeypadCodes = await getAllKeypadCodes(env);

    let formattedDateAsName = getFormattedDateAsName(request.checkInDate, request.checkOutDate);
    const allBookings = await getAllOpenBookings(env);
    const requestNameInitials = "," + await getNameInitialsOfRequest(request, allBookings, env);
    let formattedDateAsNameWithInitials = `${formattedDateAsName}${requestNameInitials}`;

    const existingEntriesWithSameCodeAndName = allCurrentKeypadCodes.filter(
        (entry) => String(entry.code) === request.pinCode && entry.name === formattedDateAsNameWithInitials
    );

    if (existingEntriesWithSameCodeAndName.length > 0) {
        console.log(`Nuki-Code ${request.pinCode} bereits vorhanden: ${existingEntriesWithSameCodeAndName[0].name}`);
        return "OK";
    }

    const nukiPayload = buildNukiCreatePayload(request, env);

    const entriesToDeleteBecauseOfSameCode = allCurrentKeypadCodes.filter(
        (entry) => (String(entry.code) === request.pinCode && entry.name !== formattedDateAsNameWithInitials)
    );
    if (entriesToDeleteBecauseOfSameCode.length > 0) {
        formattedDateAsName = getFormattedDateAsName(
            getOlderDate(request.checkInDate, (entriesToDeleteBecauseOfSameCode.at(0) as NukiAuthEntry).allowedFromDate),
            getNewerDate(request.checkOutDate, (entriesToDeleteBecauseOfSameCode.at(0) as NukiAuthEntry).allowedUntilDate));
        console.log(`Neuer Zeitraum ermittelt: ${formattedDateAsName}`);
        const existingNameInitials = getExistingNameInitialsOfNukiAuthEntry(entriesToDeleteBecauseOfSameCode.at(0) as NukiAuthEntry);
        formattedDateAsNameWithInitials = `${formattedDateAsName}${existingNameInitials}${requestNameInitials}`;
        if (formattedDateAsNameWithInitials.length > 20) {
            console.log(`Warnung: Der Name des Nuki-Codes ist länger als 20 Zeichen: ${formattedDateAsNameWithInitials}`);
            await sendErrorNotificationEmail(`Warnung: Der Name des Nuki-Codes ist länger als 20 Zeichen: ${formattedDateAsNameWithInitials}`,
                request.firstName + " " + request.lastName, `${request.checkInDate} - ${request.checkOutDate}`, env, request.pinCode);
        }
        nukiPayload.allowedFromDate = `${getOlderDate(request.checkInDate, (entriesToDeleteBecauseOfSameCode.at(0) as NukiAuthEntry).allowedFromDate)}T13:00:00.000Z`;
        nukiPayload.allowedUntilDate = `${getNewerDate(request.checkOutDate, (entriesToDeleteBecauseOfSameCode.at(0) as NukiAuthEntry).allowedUntilDate)}T09:00:00.000Z`;
        await handleDeletionOfEntries(entriesToDeleteBecauseOfSameCode, env);
    } else {
        const entriesToDeleteBecauseOfSameNameButDifferentCode = allCurrentKeypadCodes.filter(
            (entry) => (String(entry.code) !== request.pinCode && entry.name === formattedDateAsNameWithInitials)
        );
        if (entriesToDeleteBecauseOfSameNameButDifferentCode.length > 0) {
            await handleDeletionOfEntries(entriesToDeleteBecauseOfSameNameButDifferentCode, env);
        }
    }

    nukiPayload.name = formattedDateAsNameWithInitials;
    await createKeypadCode(nukiPayload, env);
    console.log(`Neuer Nuki-Code ${request.pinCode} gesetzt: ${formattedDateAsNameWithInitials}`);
    await sendConfirmationMail(request, allBookings, env, formattedDateAsName);
    return "OK";
}

export async function handler(event: LambdaLikeEvent,
                              env: Env): Promise<LambdaLikeResponse> {
    let payload;
    try {
        payload = parseAndValidateDefineKeypadCodeRequest(event.body);
        const result = await defineKeypadCode(payload, env);

        return {
            statusCode: 200,
            headers: textHeaders,
            body: result
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unbekannter Fehler im Keypad-Code Prozess.";
        console.log(`Fehler im Keypad-Code Prozess: ${message}`);
        await sendErrorNotificationEmail(`Fehler im Keypad-Code Prozess: ${message}`,
            payload?.firstName + " " + payload?.lastName, `${payload?.checkInDate} - ${payload?.checkOutDate}`, env, payload?.pinCode);
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({message})
        };
    }
}


