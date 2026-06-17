import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = { name?: string; email?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
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

  // 1) Persist to Supabase (online Postgres database)
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

  // 2) Optionally forward via Formspree (email delivery)
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

  // 3) No backend configured (or all failed) → tell the client to use mailto
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
