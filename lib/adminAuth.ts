import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// One owner: ADMIN_USERNAME + ADMIN_PASSWORD. A successful sign-in sets an HttpOnly cookie holding an
// expiry and an HMAC of it; the key mixes ADMIN_SECRET with the password, so
// changing ADMIN_PASSWORD signs every existing session out.

export const ADMIN_COOKIE = "pf_admin";
export const SESSION_DAYS = 30;

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);

const key = () => `admin-session|${process.env.ADMIN_SECRET}|${process.env.ADMIN_PASSWORD}`;
const sign = (v: string) => createHmac("sha256", key()).update(v).digest("base64url");

function same(a: string, b: string) {
  // compare fixed-length digests so neither length nor content leaks through timing
  const da = createHmac("sha256", "cmp").update(a).digest();
  const dbb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(da, dbb);
}

export function credentialsMatch(username: string, password: string) {
  if (!adminConfigured()) return false;
  const userOk = same(username.trim().toLowerCase(), (process.env.ADMIN_USERNAME ?? "admin").trim().toLowerCase());
  const passOk = same(password, process.env.ADMIN_PASSWORD as string);
  return userOk && passOk;
}

export function newSession() {
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  return `${exp}.${sign(exp)}`;
}

export function isAdmin() {
  if (!adminConfigured()) return false;
  const raw = cookies().get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}
