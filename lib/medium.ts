import { articles as fallback, type Article } from "@/data/articles";

// Live Medium posts from the public RSS feed (latest 10), cached for an hour.
// Falls back to the hand-picked list in data/articles.ts if Medium is unreachable.
const FEED = "https://medium.com/feed/@KUSH_24";

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const pick = (xml: string, tag: string) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : "";
};

const all = (xml: string, tag: string) => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(decode(m[1]));
  return out;
};

function tagFor(categories: string[]): Article["tag"] {
  const c = categories.join(" ").toLowerCase();
  if (/horror|scary|ghost|haunt|creepy/.test(c)) return "Horror";
  if (/fiction|short-story|storytelling|\bstory\b|stories/.test(c)) return "Story";
  if (/tech|programming|coding|software|\bai\b|developer|javascript|python|vibe|startup/.test(c))
    return "Tech";
  return "Essay";
}

const fmtDate = (d: string) => {
  const t = new Date(d);
  return isNaN(+t) ? "" : t.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export async function getMediumPosts(): Promise<{ posts: Article[]; live: boolean }> {
  try {
    const res = await fetch(FEED, {
      next: { revalidate: 3600 },
      headers: { "user-agent": "Mozilla/5.0 (portfolio feed reader)" },
    });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    const posts = items
      .map((it) => {
        const content = pick(it, "content:encoded");
        const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const img = it.match(/<img[^>]+src="([^"]+)"/)?.[1];
        const post: Article = {
          title: pick(it, "title"),
          url: pick(it, "link").split("?")[0],
          date: fmtDate(pick(it, "pubDate")),
          tag: tagFor(all(it, "category")),
          excerpt: text ? text.slice(0, 120).replace(/\s\S*$/, "") + "…" : undefined,
          image: img,
        };
        return post;
      })
      .filter((p) => p.title && p.url);
    if (posts.length === 0) throw new Error("empty feed");
    return { posts, live: true };
  } catch {
    return { posts: fallback, live: false };
  }
}
