"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, SESSION_DAYS, credentialsMatch, isAdmin, newSession } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { limiter } from "@/lib/visitor";

// 8 sign-in attempts per address per 15 minutes
const allowLogin = limiter(8, 15 * 60_000);

export async function login(form: FormData) {
  const ip = (headers().get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  if (!allowLogin(ip)) redirect("/admin?e=slow");
  const ok = credentialsMatch(String(form.get("username") ?? ""), String(form.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 700));
    redirect("/admin?e=wrong");
  }
  cookies().set(ADMIN_COOKIE, newSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin");
}

async function onMessage(form: FormData, run: (id: number) => Promise<unknown>) {
  if (!isAdmin()) return;
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  await run(id);
  revalidatePath("/admin");
}

export async function setRead(form: FormData) {
  const read = form.get("read") === "1";
  await onMessage(form, (id) =>
    db()!`update portfolio.messages set read_at = ${read ? new Date().toISOString() : null} where id = ${id}`
  );
}

export async function deleteMessage(form: FormData) {
  await onMessage(form, (id) => db()!`delete from portfolio.messages where id = ${id}`);
}
