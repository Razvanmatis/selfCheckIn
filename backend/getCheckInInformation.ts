import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initiateCheckInProcess } from "./worker/src/initiateCheckInProcess.js";
import type { Env } from "./env.js";
import {CheckInLookupPayload} from "./types/checkInLookupPayload.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
const checkInInstructionsPdfPath = resolve(
  currentDir,
  "..",
  "frontend",
  "src",
  "assets",
  "check_in_guestroom.pdf"
);

export async function getCheckInInformation(
  request: CheckInLookupPayload,
  env: Env
): Promise<Buffer | "validationError"> {
  // Per business rule, validate the booking first via the existing check-in process.
  const checkInValidationResult = await initiateCheckInProcess(request, env);

  if (checkInValidationResult !== "OK") {
    return "validationError";
  }

  return readFile(checkInInstructionsPdfPath);
}

