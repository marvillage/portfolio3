"use client";

import { useEffect } from "react";

// Cookieless visit tracking for the admin dashboard. Sends small batches to
// /api/track with sendBeacon: the page view, each section the reader actually
// scrolls through, outbound clicks (live demos, GitHub, résumé, email) and how
// long the tab stayed visible. Nothing is stored in cookies or localStorage; a
// per-tab session id lives in sessionStorage only.

type Ev = { kind: "view" | "section" | "click" | "leave"; path: string; name?: string; value?: number };

function sessionId() {
  try {
    let id = sessionStorage.getItem("pf_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      sessionStorage.setItem("pf_sid", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

function clickName(a: HTMLAnchorElement) {
  const href = a.getAttribute("href") ?? "";
  if (href.startsWith("mailto:")) return "email";
  if (/\.pdf($|\?)/i.test(href)) return "résumé";
  try {
    const url = new URL(href, location.href);
    if (url.host === location.host) return null;
    return `${url.host.replace(/^www\./, "")}${url.pathname}`.replace(/\/$/, "").slice(0, 120);
  } catch {
    return null;
  }
}

export default function Analytics() {
  useEffect(() => {
    const path = location.pathname;
    const session = sessionId();
    const queue: Ev[] = [];
    const send = () => {
      if (!queue.length) return;
      const body = JSON.stringify({ events: queue.splice(0), referrer: document.referrer, session });
      try {
        if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "text/plain" }))) return;
      } catch {}
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    };

    queue.push({ kind: "view", path, value: window.innerWidth });
    send();

    // a section counts as seen once it crosses the middle band of the viewport
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting && id && !seen.has(id)) {
            seen.add(id);
            queue.push({ kind: "section", path, name: id });
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );
    document.querySelectorAll<HTMLElement>("section[id]").forEach((s) => io.observe(s));

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const name = clickName(a as HTMLAnchorElement);
      if (!name) return;
      queue.push({ kind: "click", path, name });
      send();
    };
    document.addEventListener("click", onClick, true);

    // time on page: visible time only, reported (cumulatively) whenever the tab hides
    let visibleMs = 0;
    let since = document.visibilityState === "visible" ? performance.now() : 0;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (since) visibleMs += performance.now() - since;
        since = 0;
        queue.push({ kind: "leave", path, value: Math.round(visibleMs / 1000) });
        send();
      } else {
        since = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(send, 15_000);

    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
      send();
    };
  }, []);

  return null;
}
