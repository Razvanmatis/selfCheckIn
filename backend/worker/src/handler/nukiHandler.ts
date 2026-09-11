import {EnvBoth} from "../types/envBoth";
import {NukiAuthEntry} from "../types/nukiAuthEntry";
import {NukiCreateAuthPayload} from "../types/nukiCreateAuthPayload";

const nukiBaseUrl = "https://api.nuki.io";
const retryDelayMs = 3000;

export async function forceNukiSync(env: EnvBoth): Promise<void> {
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

async function wait(ms: number): Promise<void> {
    const start = Date.now();
    let remaining = ms;

    // Enforce a minimum wait duration even with timer jitter.
    while (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
        remaining = ms - (Date.now() - start);
    }
}

export async function getAllKeypadCodes(env: EnvBoth): Promise<NukiAuthEntry[]> {
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

export async function deleteKeypadCode(entryId: string, env: EnvBoth): Promise<void> {
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

export async function createKeypadCode(payload: NukiCreateAuthPayload, env: EnvBoth): Promise<void> {
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

export async function handleDeletionOfEntries(existingEntriesToDelete: NukiAuthEntry[], env: EnvBoth) {
    for (const entry of existingEntriesToDelete) {
        await deleteKeypadCode(entry.id, env);
        console.log(`Nuki-Code ${entry.code} entfernt: ${entry.name}`);
    }

    await forceNukiSync(env);
    console.log("Nuki-Sync erfolgreich durchgeführt.");
}