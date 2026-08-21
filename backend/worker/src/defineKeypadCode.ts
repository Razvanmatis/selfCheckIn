import {initiateCheckInProcess} from "./initiateCheckInProcess.js";
import { validateCheckInLookupPayload } from "./validation.js";
import type { Env } from "./env.js";

type DefineKeypadCodeRequest = {
    firstName: string;
    lastName: string;
    phone: string;
    checkInDate: string;
    checkOutDate: string;
    pinCode: string;
};

type NukiAuthEntry = {
    id: string;
    smartlockId: number;
    authId: number;
    code: number;
    type: number;
    name: string;
    enabled: boolean;
    remoteAllowed: boolean;
    lockCount: number;
    lastActiveDate?: string;
    creationDate?: string;
    updateDate?: string;
};

type NukiCreateAuthPayload = {
    name: string;
    allowedFromDate: string;
    allowedUntilDate: string;
    allowedWeekDays: number;
    allowedFromTime: number;
    allowedUntilTime: number;
    accountUserId: number;
    smartlockIds: number[];
    remoteAllowed: boolean;
    smartActionsEnabled: boolean;
    type: number;
    code: number;
};

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

const retryDelayMs = 2000;
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
    for (let attempt = 0; attempt < 3; attempt += 1) {
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

        if (attempt < 2) {
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
            throw new Error("Bestehender Nuki-Code konnte nicht entfernt werden.");
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
            throw new Error("Neuer Nuki-Keypad Code konnte nicht gesetzt werden.");
        }

        if (attempt < 5) {
            await wait(retryDelayMs);
            console.log("Erneuter Versuch, Nuki-Code zu setzen..." + ` (Versuch ${attempt + 2} von 6)`);
        }
    }
}

function parseAndValidatePayload(body: string | null): DefineKeypadCodeRequest {
    if (!body) {
        throw new Error("Request body fehlt.");
    }

    const parsed = JSON.parse(body) as Partial<DefineKeypadCodeRequest>;

    const validatedLookup = validateCheckInLookupPayload(parsed);

    if (!parsed.pinCode || parsed.pinCode.trim().length === 0) {
        throw new Error("Pflichtfeld fehlt: pinCode");
    }

    return {
        firstName: validatedLookup.firstName,
        lastName: validatedLookup.lastName,
        phone: validatedLookup.phone,
        checkInDate: validatedLookup.checkInDate,
        checkOutDate: validatedLookup.checkOutDate,
        pinCode: parsed.pinCode.trim()
    };
}

function isCodeValid(payload: DefineKeypadCodeRequest): boolean {
    if (!/^\d{6}$/.test(payload.pinCode)) {
        return false;
    }

    if (payload.pinCode.includes("0")) {
        return false;
    }

    return !payload.pinCode.startsWith("12");
}

function buildNukiCreatePayload(payload: DefineKeypadCodeRequest,
                                env: Env): NukiCreateAuthPayload {
    return {
        name: getFormattedDateAsName(payload.checkInDate, payload.checkOutDate),
        allowedFromDate: `${payload.checkInDate}T13:00:00.000Z`,
        allowedUntilDate: `${payload.checkOutDate}T09:00:00.000Z`,
        allowedWeekDays: 127,
        allowedFromTime: 0,
        allowedUntilTime: 0,
        accountUserId: 0,
        smartlockIds: [Number(env.NUKI_SMARTLOCK_ID)],
        remoteAllowed: true,
        smartActionsEnabled: true,
        type: 13,
        code: Number(payload.pinCode)
    };
}

export async function defineKeypadCode(request: DefineKeypadCodeRequest,
                                       env: Env): Promise<string> {
    if (!isCodeValid(request)) {
        return "validationError";
    }

    const checkInValidationResult = await initiateCheckInProcess(request, env);

    if (checkInValidationResult !== "OK") {
        return "validationError";
    }

    await forceNukiSync(env);
    console.log("Nuki-Sync erfolgreich durchgeführt.");

    const entries = await getAllKeypadCodes(env);

    const formattedDateAsName = getFormattedDateAsName(request.checkInDate, request.checkOutDate);

    const existingEntriesWithSameCodeAndName = entries.filter(
        (entry) => String(entry.code) === request.pinCode && entry.name === formattedDateAsName
    );

    if (existingEntriesWithSameCodeAndName.length > 0) {
        console.log(`Nuki-Code ${request.pinCode} bereits vorhanden: ${existingEntriesWithSameCodeAndName[0].name}`);
        return "OK";
    }

    const existingEntriesToDelete = entries.filter(
        (entry) => (String(entry.code) === request.pinCode && entry.name !== formattedDateAsName)
            || ((String(entry.code) !== request.pinCode && entry.name === formattedDateAsName))
    );

    if (existingEntriesToDelete.length > 0) {
        for (const entry of existingEntriesToDelete) {
            await deleteKeypadCode(entry.id, env);
            console.log(`Nuki-Code ${entry.code} entfernt: ${entry.name}`);
        }

        await forceNukiSync(env);
        console.log("Nuki-Sync erfolgreich durchgeführt.");
    }

    const nukiPayload = buildNukiCreatePayload(request, env);
    await createKeypadCode(nukiPayload, env);
    console.log(`Neuer Nuki-Code ${request.pinCode} gesetzt: ${formattedDateAsName}`);
    return "OK";
}

function formatDateToDayMonth(value: string): string {
    // Erlaubt z. B. 2026-08-21 oder 2026.08.21
    const match = value.trim().match(/^(\d{4})[-.](\d{2})[-.](\d{2})$/);
    if (!match) {
        throw new Error(`Ungueltiges Datumsformat: ${value}`);
    }

    const [, , month, day] = match;
    return `${day}.${month}`;
}

function getFormattedDateAsName(checkInDate: string, checkOutDate: string): string {
    return `${formatDateToDayMonth(checkInDate)} - ${formatDateToDayMonth(checkOutDate)}`;
}

export async function handler(event: LambdaLikeEvent,
                              env: Env): Promise<LambdaLikeResponse> {
    try {
        const payload = parseAndValidatePayload(event.body);
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
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({message})
        };
    }
}


