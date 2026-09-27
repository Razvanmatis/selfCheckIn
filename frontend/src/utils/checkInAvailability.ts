export function isCheckInUnavailable(now: Date): boolean {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return utcMinutes >= 11 * 60 + 50 && utcMinutes < 12 * 60 + 10;
}
