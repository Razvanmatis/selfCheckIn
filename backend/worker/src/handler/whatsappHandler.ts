import {Env} from "../types/env";
import {sendGeneralMessageToAdmin} from "../services/mailService";
import {EnvBoth} from "../types/envBoth";

export async function sendCheckInMessageToGuestByWhatsApp(
    env: Env,
    guestPhoneNumber: string
): Promise<void> {
    const response = await fetch(
        `https://graph.facebook.com/v25.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: guestPhoneNumber,
                type: "template",
                template: {
                    name: "check_in",
                    language: {
                        code: "de"
                    }
                }
            })
        }
    );
    const responseText = await response.text();
    if (!response.ok) {
        await sendGeneralMessageToAdmin(`WhatsApp API Fehler beim Versuch, die Check-In Nachricht an ${guestPhoneNumber} zu senden (${response.status}): ${responseText}`, env);
    }
}

export async function sendCodeMessageToGuestByWhatsApp(
    env: EnvBoth,
    guestPhoneNumber: string,
    code: string
): Promise<void> {
    const response = await fetch(
        `https://graph.facebook.com/v25.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: guestPhoneNumber,
                type: "template",
                template: {
                    name: "code",
                    language: {
                        code: "de"
                    },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "text",
                                    parameter_name: "code",
                                    text: code
                                }
                            ]
                        }
                    ]
                }
            })
        }
    );
    const responseText = await response.text();
    if (!response.ok) {
        await sendGeneralMessageToAdmin(`WhatsApp API Fehler beim Versuch, die Code Nachricht an ${guestPhoneNumber} zu senden (${response.status}): ${responseText}`, env);
    }
}

export async function sendResponseToGuestByWhatsApp(
    env: EnvBoth,
    guestPhoneNumber: string,
    text: string
): Promise<void> {
    const response = await fetch(
        `https://graph.facebook.com/v25.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.WHATSAPP_API_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: guestPhoneNumber,
                type: "text",
                text: {
                    body: text
                }
            })
        }
    );
    const responseText = await response.text();
    if (!response.ok) {
        await sendGeneralMessageToAdmin(
            `WhatsApp API Fehler beim Versuch, die Antwort Nachricht an ${guestPhoneNumber} zu senden (${response.status}): ${responseText}`,
            env
        );
    }
}