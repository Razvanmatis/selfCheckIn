import {EnvBoth} from "../types/envBoth";
import {MailRecipient, SendMailInput} from "../services/mailService";

export async function sendMail(
    input: SendMailInput,
    env: EnvBoth
): Promise<{ messageId?: string; status: "sent" }> {
    const apiKey = env.BREVO_API_KEY?.trim();
    const from = env.EMAIL_FROM?.trim();

    if (!apiKey) {
        throw new Error("Missing Brevo configuration: BREVO_API_KEY is required.");
    }

    if (!from) {
        throw new Error("Missing sender configuration: EMAIL_FROM is required.");
    }

    if (!input.subject?.trim()) {
        throw new Error("Email subject is required.");
    }

    if (!input.text?.trim() && !input.html?.trim()) {
        throw new Error("Email must contain either text or HTML content.");
    }

    const body = {
        sender: {
            email: from,
            name: "Raz Check-In"
        },
        to: normalizeRecipients(input.to),
        subject: input.subject.trim(),
        ...(input.text?.trim()
            ? {textContent: input.text.trim()}
            : {}),
        ...(input.html?.trim()
            ? {htmlContent: input.html.trim()}
            : {}),
        ...(input.replyTo?.trim()
            ? {
                replyTo: {
                    email: input.replyTo.trim()
                }
            }
            : {})
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
            `Brevo API request failed (${response.status}): ${errorBody}`
        );
    }

    const result = (await response.json()) as {
        messageId?: string;
    };

    return {
        messageId: result.messageId,
        status: "sent"
    };
}

function normalizeRecipients(recipients: MailRecipient[]) {
    if (!recipients.length) {
        throw new Error("At least one recipient is required.");
    }

    return recipients.map((recipient) => {
        if (typeof recipient === "string") {
            const email = recipient.trim();

            if (!email) {
                throw new Error("Recipient email is required.");
            }

            return {email};
        }

        if (!recipient.email?.trim()) {
            throw new Error("Recipient email is required.");
        }

        return {
            email: recipient.email.trim(),
            ...(recipient.name?.trim()
                ? {name: recipient.name.trim()}
                : {})
        };
    });
}