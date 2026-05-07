import type { FindPasswordMethod } from "./schema";

const MIN_PHONE_DIGITS_FOR_MASK = 8;

function maskEmail(value: string): string {
  if (!value.includes("@")) return value;
  const [local, domain] = value.split("@");
  if (!local || !domain) return value;
  const visibleLength = Math.min(2, local.length);
  const visible = local.slice(0, visibleLength);
  const hidden = "*".repeat(Math.max(local.length - visibleLength, 1));
  return `${visible}${hidden}@${domain}`;
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < MIN_PHONE_DIGITS_FOR_MASK) return value;
  return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
}

export function maskAccount(value: string, method: FindPasswordMethod): string {
  const trimmed = value.trim();
  return method === "email" ? maskEmail(trimmed) : maskPhone(trimmed);
}
