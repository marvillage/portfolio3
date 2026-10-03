import { createHash } from "node:crypto";

// Vercel sets x-real-ip / x-forwarded-for to the visitor's address. Only a short hash is
// ever stored, never the address itself.
export function visitorKey(h: Headers): string {
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHash("sha256").update(`daily-commit:${ip}`).digest("hex").slice(0, 20);
}
