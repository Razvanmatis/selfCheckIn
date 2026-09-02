import {EnvBoth} from "./envBoth";

export async function getSmoobuHeaders(env: EnvBoth, method: string, path: string, body?: string) {
    const timestamp = new Date().toISOString();
    const nonce = crypto.randomUUID();
    const url = new URL(path);
    const queryString = getQueryString(url);
    const bodyHash = await sha256(body ?? "");
    const signature = await createSmoobuSignature(
        method,
        url.pathname,
        queryString,
        timestamp,
        nonce,
        bodyHash,
        env.SMOOBU_API_KEY,
        env.SMOOBU_API_SECRET
    );
    return {
        "X-API-Key": env.SMOOBU_API_KEY,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": signature,
        "Content-Type": "application/json",
    };
}

async function sha256(value: string): Promise<string> {
    const data = new TextEncoder().encode(value);

    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function getQueryString(url: URL) {
    return Array.from(url.searchParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
}

async function createSmoobuSignature(
    method: string,
    path: string,
    queryString: string,
    timestamp: string,
    nonce: string,
    bodyHash: string,
    apiKey: string,
    secret: string
): Promise<string> {

    const canonicalString =
        `${method}\n` +
        `${path}\n` +
        `${queryString}\n` +
        `${timestamp}\n` +
        `${nonce}\n` +
        `${bodyHash}\n` +
        `${apiKey}`;

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(canonicalString)
    );

    return btoa(
        String.fromCharCode(...new Uint8Array(signature))
    );
}