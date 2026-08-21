export function sanitizePhoneInput(rawValue: string): string {
  // Allow only digits, +, (), spaces, and hyphens.
  let filtered = rawValue.replace(/[^\d+\s()\-]/g, "");

  // Plus sign is only valid in first position.
  if (filtered.length > 0 && filtered[0] !== "+") {
    filtered = filtered.replace(/\+/g, "");
  } else if (filtered.length > 1) {
    filtered = filtered[0] + filtered.slice(1).replace(/\+/g, "");
  }

  return filtered;
}

export function toDigitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

