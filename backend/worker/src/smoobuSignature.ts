export async function createSmoobuSignature(
    method: string,
    path: string,
    queryString: string,
    timestamp: string,
    nonce: string,
    apiKey: string,
    secret: string
): Promise<string> {

    const bodyHash =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

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