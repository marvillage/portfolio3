import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isBot, limiter, requestInfo } from "@/lib/visitor";

export const runtime = "nodejs";

type Payload = { name?: string; email?: string; message?: string; website?: string };

// 5 messages per address per 10 minutes is plenty for a person and stops floods
const allow = limiter(5, 10 * 60_000);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // honeypot: a hidden field people never see; bots fill it in. Pretend it worked.
  if ((body.website ?? "").trim()) return NextResponse.json({ ok: true });

  const info = requestInfo(req);
  if (!allow(info.ip || info.ua)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages in a short time. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "All fields are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }
  if (name.length > 200 || email.length > 320) {
    return NextResponse.json({ ok: false, error: "Name or email is too long." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Message is too long." },
      { status: 400 }
    );
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const FORMSPREE = process.env.FORMSPREE_ENDPOINT;

  let stored = false;

  // 1) Store in the portfolio database; the admin inbox at /admin reads from here
  const sql = db();
  if (sql && !isBot(info.ua)) {
    try {
      await sql`insert into portfolio.messages (name, email, message, country, city, device)
                values (${name}, ${email}, ${message}, ${info.country}, ${info.city}, ${info.device})`;
      stored = true;
    } catch (e) {
      console.error("Message insert failed:", e);
    }
  }

  // 2) Also persist to Supabase when configured (older backend)
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) stored = true;
      else console.error("Supabase insert failed:", res.status, await res.text());
    } catch (e) {
      console.error("Supabase insert error:", e);
    }
  }

  // 3) Optionally forward via Formspree (email delivery)
  if (FORMSPREE) {
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) stored = true;
    } catch (e) {
      console.error("Formspree error:", e);
    }
  }

  if (stored) {
    return NextResponse.json({ ok: true });
  }

  // 4) No backend configured (or all failed) → tell the client to use mailto
  return NextResponse.json(
    {
      ok: false,
      fallback: true,
      error:
        "Message backend isn't configured yet — opening your email client instead.",
    },
    { status: 200 }
  );
}
