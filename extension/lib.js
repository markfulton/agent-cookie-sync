// Agent Cookie Sync, shared logic for the background worker and the
// settings page: what a "site" is, which sites are the big three, how the
// saved settings turn the full cookie jar into the export, and how
// "recently used" is worked out.

export const DEFAULT_SETTINGS = {
  mode: "all",          // "all" | "include" | "exclude"
  domains: [],          // registrable domains picked on the settings page
  skipBigThree: true,   // never export Google, Meta or X cookies
  recentDays: 0,        // 0 = any time, else only sites used in the last N days
  instantSync: true,    // export soon after a sign-in cookie changes
  everyMinutes: 15      // the scheduled export interval
};

export const RECENT_CHOICES = [
  { days: 0, label: "Any time" },
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" }
];

export const INTERVAL_CHOICES = [5, 15, 30, 60, 120];

// Second-level labels that make the registrable domain three labels long
// (example.co.uk, example.com.au). A short list is enough for grouping.
const SECOND_LEVEL = new Set([
  "co", "com", "net", "org", "gov", "edu", "ac", "or", "ne", "go", "ltd", "plc", "nom", "biz", "info"
]);

export function baseDomain(host) {
  let h = String(host || "").trim().toLowerCase();
  if (h.startsWith(".")) h = h.slice(1);
  if (!h.includes(".") || /^[\d.]+$/.test(h) || h.includes(":")) return h;
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  const tld = parts[parts.length - 1];
  const sld = parts[parts.length - 2];
  if (tld.length === 2 && SECOND_LEVEL.has(sld)) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

const BIG_THREE_SUFFIXES = [
  // Google
  "googleusercontent.com", "googleapis.com", "gstatic.com", "googlevideo.com",
  "googleadservices.com", "googlesyndication.com", "googletagmanager.com", "doubleclick.net",
  "youtube.com", "ytimg.com", "gmail.com", "blogger.com", "blogspot.com", "withgoogle.com",
  // Meta
  "facebook.com", "fb.com", "fb.me", "fbcdn.net", "messenger.com", "instagram.com",
  "cdninstagram.com", "whatsapp.com", "whatsapp.net", "meta.com", "threads.net", "threads.com",
  "oculus.com", "workplace.com",
  // X
  "x.com", "twitter.com", "twimg.com", "t.co"
];

export function isBigThree(host) {
  let h = String(host || "").toLowerCase();
  if (h.startsWith(".")) h = h.slice(1);
  if (/(^|\.)google\.[a-z]{2,3}$/.test(h)) return true;
  if (/(^|\.)google\.(co|com)\.[a-z]{2}$/.test(h)) return true;
  return BIG_THREE_SUFFIXES.some((s) => h === s || h.endsWith("." + s));
}

export function bigThreeLabel(host) {
  let h = String(host || "").toLowerCase();
  if (h.startsWith(".")) h = h.slice(1);
  if (/(^|\.)(x|twitter|twimg)\.com$/.test(h) || /(^|\.)t\.co$/.test(h)) return "X";
  if (/(^|\.)(facebook|fb|messenger|instagram|cdninstagram|whatsapp|meta|threads|oculus|workplace)\.(com|net|me)$/.test(h) || /(^|\.)fbcdn\.net$/.test(h)) return "Meta";
  return "Google";
}

export async function loadSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  if (!Array.isArray(merged.domains)) merged.domains = [];
  if (!["all", "include", "exclude"].includes(merged.mode)) merged.mode = "all";
  merged.recentDays = Number(merged.recentDays) || 0;
  merged.everyMinutes = Number(merged.everyMinutes) || 15;
  return merged;
}

export async function saveSettings(patch) {
  const current = await loadSettings();
  const next = { ...current, ...patch };
  await chrome.storage.local.set({ settings: next });
  return next;
}

// Does this cookie pass the site rules? `recentSet` is null when the
// recent filter is off, otherwise a Set of registrable domains.
export function cookieAllowed(cookie, settings, recentSet) {
  const base = baseDomain(cookie.domain);
  if (settings.skipBigThree && isBigThree(cookie.domain)) return false;
  if (settings.mode === "include" && !settings.domains.includes(base)) return false;
  if (settings.mode === "exclude" && settings.domains.includes(base)) return false;
  if (recentSet && !recentSet.has(base)) return false;
  return true;
}

export function selectCookies(all, settings, recentSet) {
  const cookies = [];
  let skippedBigThree = 0;
  let skippedSite = 0;
  let skippedRecent = 0;
  for (const c of all) {
    const base = baseDomain(c.domain);
    if (settings.skipBigThree && isBigThree(c.domain)) { skippedBigThree += 1; continue; }
    if (settings.mode === "include" && !settings.domains.includes(base)) { skippedSite += 1; continue; }
    if (settings.mode === "exclude" && settings.domains.includes(base)) { skippedSite += 1; continue; }
    if (recentSet && !recentSet.has(base)) { skippedRecent += 1; continue; }
    cookies.push(c);
  }
  const sites = new Set(cookies.map((c) => baseDomain(c.domain)));
  const summary = {
    mode: settings.mode,
    picked_sites: settings.mode === "all" ? 0 : settings.domains.length,
    skip_big_three: Boolean(settings.skipBigThree),
    recent_days: settings.recentDays || 0,
    total_in_chrome: all.length,
    exported: cookies.length,
    sites: sites.size,
    skipped_big_three: skippedBigThree,
    skipped_by_site_rule: skippedSite,
    skipped_not_recent: skippedRecent
  };
  return { cookies, summary };
}

export async function hasHistoryPermission() {
  try {
    return await chrome.permissions.contains({ permissions: ["history"] });
  } catch (_) {
    return false;
  }
}

// registrable domain -> last time it was used (ms). History when the
// permission is granted, plus the cookie changes this extension has seen.
export async function lastUsedMap(sinceMs = 0) {
  const map = {};
  const bump = (d, t) => { if (d && t && (!map[d] || t > map[d])) map[d] = t; };
  if (await hasHistoryPermission()) {
    try {
      const items = await chrome.history.search({ text: "", startTime: sinceMs, maxResults: 100000 });
      for (const it of items) {
        try { bump(baseDomain(new URL(it.url).hostname), it.lastVisitTime || 0); } catch (_) {}
      }
    } catch (_) {}
  }
  const { activity } = await chrome.storage.local.get("activity");
  for (const [d, t] of Object.entries(activity || {})) {
    if (t >= sinceMs) bump(d, t);
  }
  return map;
}

export async function recentDomainSet(days) {
  if (!days) return null;
  const since = Date.now() - days * 86400000;
  const map = await lastUsedMap(since);
  return new Set(Object.keys(map));
}
