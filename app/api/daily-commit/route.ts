import { NextResponse } from "next/server";
import { CircleError, getBoard } from "@/lib/circle";
import { visitorKey } from "@/lib/clientIp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS: Record<CircleError["code"], number> = {
  invalid: 400,
  not_found: 404,
  no_token: 503,
  rate_limited: 429,
  upstream: 502,
};

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  try {
    return NextResponse.json({ ok: true, board: await getBoard(u, visitorKey(req.headers)) });
  } catch (e) {
    if (e instanceof CircleError) return NextResponse.json({ ok: false, error: e.message }, { status: STATUS[e.code] });
    console.error("daily-commit:", e);
    return NextResponse.json({ ok: false, error: "The press jammed. Try again." }, { status: 500 });
  }
}
