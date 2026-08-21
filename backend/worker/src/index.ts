import { Hono } from "hono";
import type { Env } from "./env";
import { initiateCheckInProcess } from "./initiateCheckInProcess";
import { parseAndValidateLookupPayload } from "./validation";
import { defineKeypadCode } from "./defineKeypadCode";
import { getCheckInInformation } from "./getCheckInInformation";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>();

app.use(
	"*",
	cors({
		origin: "*",
		allowMethods: ["GET", "PUT", "OPTIONS"],
		allowHeaders: ["Content-Type"]
	})
);

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

app.post("/api/initiateCheckInProcess", async (c) => {
	try {
		const body = await c.req.json();

		const payload = parseAndValidateLookupPayload(
			JSON.stringify(body)
		);

		const result = await initiateCheckInProcess(payload, c.env);

		return c.text(result, 200);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unbekannter Fehler im Check-In Prozess.";

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

		return c.json({ message }, 400);
	}
});

export default app;