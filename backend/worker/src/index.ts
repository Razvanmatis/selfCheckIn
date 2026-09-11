import { Hono } from "hono";
import type { Env } from "./types/env";
import { initiateCheckInProcess } from "./initiateCheckInProcess";
import { parseAndValidateCheckInLookupPayload } from "./helper/validation";
import { defineKeypadCode } from "./defineKeypadCode";
import { getCheckInInformation } from "./getCheckInInformation";
import { cors } from "hono/cors";
import { seedKnowledge } from "./seedKnowledge";
import { askKnowledge } from "./askKnowledge";
import {sendGeneralMessageToAdmin} from "./services/mailService";
import {deleteOldCodesHandler} from "./deleteOldCodes";
import {handleSmoobuWebhook} from "./handleSmoobuWebhooks";
import {timingSafeEqual} from "node:crypto";
import {deleteExpiredReservations, initWholeDatabase} from "./handler/dbHandler";

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

export default app;