import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

const normalizeUrl = (url: string) => {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) ? u.toString() : null;
  } catch {
    return null;
  }
};

const hostnameOf = (u: string) => {
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
};

const basicFallback = (u: string) => ({
  url: u,
  title: u,
  description: "",
  image: "",
  siteName: hostnameOf(u),
});

async function fetchWithTimeout(
  url: string,
  opts: RequestInit = {},
  ms = 5000
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

const pick = (...vals: string[]) => vals.find(Boolean) || "";

function resolveRelative(base: string, maybe: string) {
  if (!maybe) return "";
  try {
    if (/^https?:\/\//i.test(maybe)) return maybe;
    return new URL(maybe, base).toString();
  } catch {
    return maybe;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url");
  const target = urlParam ? normalizeUrl(urlParam) : null;
  if (!target) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const res = await fetchWithTimeout(target, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: target,
      },
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(basicFallback(target));
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const get = (sel: string) => $(sel).attr("content") || "";

    const title = pick(
      get('meta[property="og:title"]'),
      get('meta[name="twitter:title"]'),
      $("title").first().text().trim()
    );
    const description = pick(
      get('meta[property="og:description"]'),
      get('meta[name="twitter:description"]'),
      $('meta[name="description"]').attr("content") || ""
    );
    const image = pick(
      get('meta[property="og:image"]'),
      get('meta[name="twitter:image"]'),
      $('link[rel="image_src"]').attr("href") || ""
    );
    const siteName = pick(
      get('meta[property="og:site_name"]'),
      new URL(target).hostname
    );

    const imageUrl = resolveRelative(target, image);

    if (!title && !description && !imageUrl) {
      return NextResponse.json(basicFallback(target));
    }
    return NextResponse.json({
      url: target,
      title,
      description,
      image: imageUrl,
      siteName,
    });
  } catch (e: any) {
    return NextResponse.json(basicFallback(target));
  }
}
