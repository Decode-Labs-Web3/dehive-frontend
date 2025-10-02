import {
  FingerprintResult,
  NavigatorWithUserAgentData,
} from "@/interfaces/index.interfaces";

export async function fingerprintService(
  userAgent?: string
): Promise<FingerprintResult> {
  const device = detectOS(userAgent);
  const browser = detectBrowser(userAgent);
  const timezone = getTimeZone();
  const language = getLanguage();
  const audioFingerprint = await getAudioFingerprint(userAgent);

  const payload = JSON.stringify({
    device,
    browser,
    timezone,
    language,
    audioFingerprint,
    userAgent,
  });

  const fingerprint_hashed = await sha256Hex(payload);

  return { fingerprint_hashed, browser, device };
}

async function sha256Hex(str: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
  const bytes = new Uint8Array(buf);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
  } catch {
    return "Unknown";
  }
}

function getLanguage(): string {
  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  return (nav.language ||
    (nav.languages && nav.languages[0]) ||
    "en") as string;
}

function detectBrowser(userAgent?: string): string {
  // Use provided user agent or try to get from navigator
  let ua = userAgent;

  if (!ua && typeof navigator !== "undefined") {
    ua = navigator.userAgent || "";
  }

  if (!ua) {
    return "Unknown";
  }

  // Check for Edge first (newer versions)
  if (/edg\//i.test(ua)) {
    return "Edge";
  }

  // Check for Opera
  if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    return "Opera";
  }

  // Check for Chrome (but not Edge or Opera)
  if (/chrome\//i.test(ua) && !/edg\//i.test(ua) && !/opr\//i.test(ua)) {
    return "Chrome";
  }

  // Check for Firefox
  if (/firefox/i.test(ua)) {
    return "Firefox";
  }

  // Check for Safari (but not Chrome, Edge, or Opera)
  if (/safari/i.test(ua) && !/chrome|opr|edg/i.test(ua)) {
    return "Safari";
  }

  // Check for Internet Explorer
  if (/msie/i.test(ua) || /trident/i.test(ua)) {
    console.warn(
      "Internet Explorer detected - this browser is deprecated and may not be fully supported"
    );
    return "Internet Explorer";
  }

  // Try using userAgentData if available (for newer browsers)
  const nav = navigator as NavigatorWithUserAgentData;
  const uaData = nav.userAgentData;
  if (uaData && uaData.brands && Array.isArray(uaData.brands)) {
    const brand = uaData.brands.map((b) => b.brand).join(" ");
    if (brand.includes("Chromium") || brand.includes("Google Chrome"))
      return "Chrome";
    if (brand.includes("Microsoft Edge")) return "Edge";
    if (brand.includes("Opera")) return "Opera";
    if (brand.includes("Safari")) return "Safari";
  }

  return "Unknown";
}

function detectOS(userAgent?: string): string {
  let ua = userAgent;
  let p = "";

  if (!ua && typeof navigator !== "undefined") {
    const nav = navigator as Navigator;
    ua = nav.userAgent || "";
    p = nav.platform || "";
  }

  if (!ua) {
    return "Unknown";
  }

  const isTouchMac =
    /Mac/.test(p) &&
    typeof document !== "undefined" &&
    "ontouchend" in document;
  if (/iPad/.test(ua) || isTouchMac) return "iPadOS";
  if (/iPhone|iPod/.test(ua)) return "iOS";

  if (/Mac/.test(p) || /Mac OS X/.test(ua)) return "macOS";
  if (/Win/.test(p) || /Windows/.test(ua)) return "Windows";
  if (/Android/.test(ua)) return "Android";

  if (/Ubuntu/i.test(ua)) return "Ubuntu";
  if (/Arch/i.test(ua)) return "Arch Linux";
  if (/Linux/i.test(ua)) return "Linux";

  return "Unknown";
}

async function getAudioFingerprint(userAgent?: string): Promise<string> {
  async function deterministicFallback(): Promise<string> {
    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            hardwareConcurrency?: number;
            deviceMemory?: number;
          })
        : (undefined as unknown as
            | (Navigator & {
                hardwareConcurrency?: number;
                deviceMemory?: number;
              })
            | undefined);
    const lang = nav?.language || (nav?.languages && nav.languages[0]) || "en";
    const tz = (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        return "UTC";
      }
    })();
    const hc =
      nav && typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : 0;
    const dm =
      nav && typeof nav.deviceMemory === "number" ? nav.deviceMemory : 0;
    const colorDepth = typeof screen !== "undefined" ? screen.colorDepth : 24;
    const pixelRatio =
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const seed = JSON.stringify({
      ua:
        userAgent ||
        (typeof navigator !== "undefined" ? navigator.userAgent : ""),
      lang,
      tz,
      hc,
      dm,
      colorDepth,
      pixelRatio,
      osc: { type: "sawtooth", f: 1000 },
      comp: { t: -50, k: 40, r: 12, a: 0, rel: 0.25 },
    });
    const full = await sha256Hex(seed);
    return full.slice(0, 16);
  }

  try {
    if (typeof window === "undefined") {
      return await deterministicFallback();
    }

    const sampleRate = 44100;
    const frameCount = 4096;
    const windowWithAudio = window as Window & {
      OfflineAudioContext?: typeof OfflineAudioContext;
      webkitOfflineAudioContext?: typeof OfflineAudioContext;
    };
    const OfflineCtx =
      windowWithAudio.OfflineAudioContext ||
      windowWithAudio.webkitOfflineAudioContext;
    if (!OfflineCtx) return await deterministicFallback();

    const offline = new OfflineCtx(1, frameCount, sampleRate);

    const osc = offline.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 1000;

    const comp = offline.createDynamicsCompressor();
    comp.threshold.value = -50;
    comp.knee.value = 40;
    comp.ratio.value = 12;
    comp.attack.value = 0;
    comp.release.value = 0.25;

    osc.connect(comp);
    comp.connect(offline.destination);
    osc.start(0);

    const rendered = await offline.startRendering();
    const ch = rendered.getChannelData(0);

    let acc = 0 >>> 0;
    for (let i = 0; i < ch.length; i += 64) {
      const v = Math.max(-1, Math.min(1, ch[i]));
      acc = (acc * 31 + Math.round((v + 1) * 1e6)) >>> 0;
    }
    return acc.toString(16).padStart(8, "0");
  } catch {
    return await deterministicFallback();
  }
}
