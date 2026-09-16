export async function verifyWhatsAppSignature(
    rawBody: string,
    signature: string,
    appSecret: string
): Promise<boolean> {

    if (!signature.startsWith("sha256=")) {
        return false;
    }

    const receivedSignature = signature.substring("sha256=".length);

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(appSecret),
        {
            name: "HMAC",
            hash: "SHA-256"
        },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(rawBody)
    );

    const calculatedSignature = Array.from(
        new Uint8Array(signatureBuffer)
    )
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return calculatedSignature === receivedSignature;
}