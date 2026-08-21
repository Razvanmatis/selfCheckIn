import { toDigitsOnly } from "./phone";

export function sanitizePinInput(rawValue: string): string {
  return rawValue.replace(/\D/g, "").slice(0, 6);
}

export function isPinCodeValid(pinCode: string): boolean {
  return /^\d{6}$/.test(pinCode) && !pinCode.includes("0") && !pinCode.startsWith("12");
}

function randomDigitOneToNine(): string {
  return String(Math.floor(Math.random() * 9) + 1);
}

function generateRandomPinCode(): string {
  let pinCode = "";

  while (pinCode.length < 6) {
    pinCode += randomDigitOneToNine();
  }

  if (pinCode.startsWith("12")) {
    pinCode = randomDigitOneToNine() + randomDigitOneToNine() + pinCode.slice(2);
  }

  if (!isPinCodeValid(pinCode)) {
    return "111111";
  }

  return pinCode;
}

function generatePinCodeFromPhone(phone: string): string | null {
  const phoneDigits = toDigitsOnly(phone);

  if (phoneDigits.length < 6) {
    return null;
  }

  const withoutLeadingZero = phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits;
  const normalizedDigits = withoutLeadingZero.replace(/0/g, "");

  if (normalizedDigits.length < 6) {
    return null;
  }

  const candidate = normalizedDigits.startsWith("12")
    ? normalizedDigits.slice(2, 8)
    : normalizedDigits.slice(0, 6);

  return isPinCodeValid(candidate) ? candidate : null;
}

export function generateAutoPinCode(dialogPhoneNumber: string): string {
  const fromPhone = generatePinCodeFromPhone(dialogPhoneNumber.trim());

  if (fromPhone) {
    return fromPhone;
  }

  return generateRandomPinCode();
}

