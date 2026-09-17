import { Hono } from "hono";
import type { Env } from "./types/env";
import { initiateCheckInProcess } from "./usecases/initiateCheckInProcess";
import { parseAndValidateCheckInLookupPayload } from "./helper/validation";
import { defineKeypadCode } from "./usecases/defineKeypadCode";
import { getCheckInInformation } from "./usecases/getCheckInInformation";
import { cors } from "hono/cors";
import { seedKnowledge } from "./usecases/seedKnowledge";
import { askKnowledge } from "./usecases/askKnowledge";
import {sendGeneralMessageToAdmin} from "./services/mailService";
import {deleteOldCodesHandler} from "./usecases/deleteOldNukiCodes";
import {handleSmoobuWebhook} from "./services/smoobuWebhookService";
import {deleteExpiredReservations, initWholeDatabase} from "./handler/dbHandler";
import {runScheduledTasks} from "./services/scheduledService";
import {verifyWhatsAppSignature} from "./helper/whatsAppSignature";
import {handleWhatsAppWebhookMessage} from "./services/whatsappService";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type"]
	})
);

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

app.post("/api/initiateCheckInProcess", async (c) => {
	try {
		const body = await c.req.json();

		const payload = parseAndValidateCheckInLookupPayload(
			JSON.stringify(body)
		);

		const result = await initiateCheckInProcess(payload, c.env);

		return c.text(result, 200);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler im Check-In Prozess.";
		await sendGeneralMessageToAdmin(
			`Fehler im Check-In Prozess: ${message}`,
			c.env
		);
		return c.json({ message }, 400);
	}
});

app.post("/api/defineKeypadCode", async (c) => {
	try {
		const body = await c.req.json();

		const result = await defineKeypadCode(body, c.env);

		return c.text(result, 200);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler im Keypad-Code Prozess.";
		await sendGeneralMessageToAdmin(
			`Fehler im Keypad-Code Prozess: ${message}`,
			c.env
		);
		return c.json({ message }, 400);
	}
});

app.post("/api/getCheckInInformation", async (c) => {
	try {
		const body = await c.req.json();

		const payload = {
			firstName: String(body?.firstName ?? ""),
			lastName: String(body?.lastName ?? ""),
			phone: String(body?.phone ?? ""),
			checkInDate: String(body?.checkInDate ?? ""),
			checkOutDate: String(body?.checkOutDate ?? "")
		};

		const result = await getCheckInInformation(payload, c.env);

		if (result === "validationError") {
			return c.json(
				{ message: "Ungueltige Daten eingegeben!" },
				400
			);
		}

		return result;
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Laden der Check-In Instruktionen.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Laden der Check-In Instruktionen: ${message}`,
			c.env
		);
		return c.json({ message }, 400);
	}
});

app.post("/api/ai/seed-knowledge", async (c) => {
	try {
		await seedKnowledge(c.env);

		return c.json({
			success: true,
			message: "Knowledge Base erfolgreich in Vectorize gespeichert."
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Seeding der Knowledge Base.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Seeding der Knowledge Base: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

app.post("/api/ai/ask", async (c) => {
	try {
		const body = await c.req.json();

		const question = String(body?.question ?? "").trim();

		if (!question) {
			return c.json(
				{ message: "Keine Frage übergeben." },
				400
			);
		}

		const answer = await askKnowledge(
			body,
			c.env
		);

		return c.json({
			answer
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Beantworten der Frage.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Beantworten der Frage: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

app.post("/api/deleteOldCodes", async (c) => {
	try {
		const body = await c.req.json();
		const adminUser = String(body?.adminUser ?? "").trim();

		if (!adminUser) {
			return c.json(
				{ message: "Kein Admin-Benutzer übergeben." },
				400
			);
		}

		await deleteExpiredReservations(c.env);
		const answer = await deleteOldCodesHandler(
			{ body: adminUser },
			c.env
		);

		return c.json({
			answer
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Löschen der alten Codes.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Löschen der alten Codes: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

app.post("/api/smoobu/webhook", async (c) => {
	try {
		const token = c.req.query("token");
		if (token !== c.env.SMOOBU_WEBHOOK_TOKEN) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const body = await c.req.json();
		const answer = await handleSmoobuWebhook(
			c.env,
			body
		);

		return c.json({
			answer
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Bearbeiten des Smoobu-Webhooks.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Bearbeiten des Smoobu-Webhooks: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

app.post("/api/smoobu/initWholeDatabase", async (c) => {
	console.log("Received request to initialize the whole database");
	try {
		const token = c.req.query("token");
		if (token !== c.env.SMOOBU_WEBHOOK_TOKEN) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const answer = await initWholeDatabase(
			c.env
		);

		return c.json({
			answer
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Initialisieren der Datenbank.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Initialisieren der Datenbank: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

app.get("/api/whatsapp/webhook", async (c) => {
	const mode = c.req.query("hub.mode");
	const token = c.req.query("hub.verify_token");
	const challenge = c.req.query("hub.challenge");
	console.log("Received WhatsApp webhook verification request", { mode, token, challenge });
	if (
		mode === "subscribe" &&
		token === c.env.SMOOBU_WEBHOOK_TOKEN
	) {
		return c.text(challenge ?? "", 200);
	}

	return c.text("Forbidden", 403);
});

app.post("/api/whatsapp/webhook", async (c) => {
	try {
		console.log("Received WhatsApp webhook event", await c.req.text());
		const signature = c.req.header("X-Hub-Signature-256");
		if (!signature) {
			return c.text("Missing signature", 401);
		}
		const rawBody = await c.req.text();
		const isValid = await verifyWhatsAppSignature(
			rawBody,
			signature,
			c.env.WHATSAPP_SECRET
		);
		if (!isValid) {
			return c.text("Invalid signature", 401);
		}
		const body = JSON.parse(rawBody);
		const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
		if (message?.type === "text") {
			const phone = message.from;
			const text = message.text?.body;
			await handleWhatsAppWebhookMessage(c.env, phone, text ?? "");
		}
		return c.text("EVENT_RECEIVED", 200);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler beim Verarbeiten des WhatsApp-Webhooks.";
		await sendGeneralMessageToAdmin(
			`Fehler beim Verarbeiten des WhatsApp-Webhooks: ${message}`,
			c.env
		);
		return c.json({ message }, 500);
	}
});

export default {
	fetch: app.fetch,

	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	) {
		if (controller.cron !== "0 2 * * *") {
			return;
		}
		await runScheduledTasks(env);
	}
} satisfies ExportedHandler<Env>;