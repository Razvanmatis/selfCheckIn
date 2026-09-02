import cors from "cors";
import express from "express";
import "dotenv/config";
import type { Env } from "./env.js";
import {
  handler as defineKeypadCodeHandler
} from "./worker/src/defineKeypadCode.js";
import { getCheckInInformation } from "./getCheckInInformation.js";
import {
  handler as initiateCheckInProcessHandler
} from "./worker/src/initiateCheckInProcess.js";
import {sendErrorNotificationEmail} from "./worker/src/mailService.js";
import {seedKnowledge} from "./seedKnowledge.js";
import {askKnowledge} from "./askKnowledge.js";
import {deleteOldCodesHandler} from "./worker/src/deleteOldCodes.js";

const app = express();
const port = Number(process.env.PORT ?? 7071);

const env: Env = {
  SMOOBU_API_KEY: process.env.SMOOBU_API_KEY!,
  SMOOBU_API_SECRET: process.env.SMOOBU_API_SECRET!,
  NUKI_API_TOKEN: process.env.NUKI_API_TOKEN!,
  NUKI_SMARTLOCK_ID: process.env.NUKI_SMARTLOCK_ID!,
  ADMIN_NAME: process.env.ADMIN_NAME!,
  BREVO_API_KEY: process.env.BREVO_API_KEY!,
  EMAIL_FROM: process.env.EMAIL_FROM!
};

app.use(cors());
app.use(express.json());

app.post("/api/initiateCheckInProcess", async (req, res) => {
  const result = await initiateCheckInProcessHandler({ body: JSON.stringify(req.body ?? {}) }, env);

  for (const [name, value] of Object.entries(result.headers)) {
    res.setHeader(name, value);
  }

  res.status(result.statusCode).send(result.body);
});

app.post("/api/defineKeypadCode", async (req, res) => {
  const result = await defineKeypadCodeHandler({ body: JSON.stringify(req.body ?? {}) }, env);

  for (const [name, value] of Object.entries(result.headers)) {
    res.setHeader(name, value);
  }

  res.status(result.statusCode).send(result.body);
});

app.post("/api/getCheckInInformation", async (req, res) => {
  try {
    const payload = {
      firstName: String(req.body?.firstName ?? ""),
      lastName: String(req.body?.lastName ?? ""),
      phone: String(req.body?.phone ?? ""),
      checkInDate: String(req.body?.checkInDate ?? ""),
      checkOutDate: String(req.body?.checkOutDate ?? "")
    };

    const result = await getCheckInInformation(payload, env);

    if (result === "validationError") {
      res.status(400).json({ message: "Ungueltige Daten eingegeben!" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=check_in_guestroom.pdf");
    res.status(200).send(result);
  } catch (error) {
    await sendErrorNotificationEmail("Check-In-PDF konnte nicht geladen werden.",
        req.body.firstName + " " + req.body.lastName, req.body.checkInDate + "-" + req.body.checkOutDate, env);
    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Laden der Check-In Instruktionen.";
    res.status(400).json({ message });
  }
});

app.post("/api/ai/seed-knowledge", async (req, res) => {
  const result = await seedKnowledge(env);
  res.status(200).send(result);
});

app.post("/api/ai/ask", async (req, res) => {
  const result = await askKnowledge(req.body, env);
  res.status(200).send(result);
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/deleteOldCodes", async (req, res) => {
  const result = await deleteOldCodesHandler({ body: String(req.body?.adminUser ?? null) }, env);

  for (const [name, value] of Object.entries(result.headers)) {
    res.setHeader(name, value);
  }

  res.status(result.statusCode).send(result.body);
});

app.listen(port, () => {
  // Keep startup log minimal and explicit for local testing.
  console.log(`Backend is running on http://localhost:${port}`);
});
