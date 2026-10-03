import { NextResponse } from "next/server";
import { kvGet, kvIncr, kvPersistent, kvSetOnce } from "@/lib/kv";
import { visitorKey } from "@/lib/clientIp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = "dc:views";
// one view per visitor per half hour, so refreshing (or a script) can't run the count up
const REPEAT_SEC = 1800;

// Without a real store in production the count would be per server instance, so it's
// hidden rather than shown wrong.
const shown = () => kvPersistent || process.env.NODE_ENV !== "production";

export async function POST(req: Request) {
  if (!shown()) return NextResponse.json({ views: null });
  try {
    const fresh = await kvSetOnce(`dc:seen:${visitorKey(req.headers)}`, REPEAT_SEC);
    const views = fresh ? await kvIncr(KEY) : Number((await kvGet(KEY)) ?? 0);
    return NextResponse.json({ views });
  } catch {
    return NextResponse.json({ views: null });
  }
}

export async function GET() {
  if (!shown()) return NextResponse.json({ views: null });
  try {
    return NextResponse.json({ views: Number((await kvGet(KEY)) ?? 0) });
  } catch {
    return NextResponse.json({ views: null });
  }
}
