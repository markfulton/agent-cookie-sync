// Agent Cookie Sync settings page. Reads the cookie jar and the saved
// settings, shows what the next export will carry, and saves every change
// as it is made. Cookie values are never rendered or logged here.

import {
  loadSettings,
  saveSettings,
  selectCookies,
  recentDomainSet,
  lastUsedMap,
  baseDomain,
  isBigThree,
  bigThreeLabel,
  hasHistoryPermission,
  RECENT_CHOICES,
  INTERVAL_CHOICES
} from "./lib.js";

const $ = (id) => document.getElementById(id);

let settings = null;
let allCookies = [];
let sites = [];          // [{ base, count, signedIn, lastUsed, big, bigLabel }]
let usedMap = {};
let savedTimer = null;

function relative(ms) {
  if (!ms) return "no visit on record";
  const diff = Date.now() - ms;
  const m = Math.round(diff / 60000);
  if (m < 1) return "used just now";
  if (m < 60) return "used " + m + " min ago";
  const h = Math.round(m / 60);
  if (h < 24) return "used " + h + "h ago";
  const d = Math.round(h / 24);
  if (d < 45) return "used " + d + "d ago";
  return "used " + Math.round(d / 30) + " months ago";
}

function n(x) { return Number(x || 0).toLocaleString(); }

function flashSaved() {
  const el = $("saved");
  el.textContent = "Saved";
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => { el.textContent = ""; }, 1600);
}

async function persist(patch) {
  settings = await saveSettings(patch);
  flashSaved();
  await renderPreview();
  renderListMeta();
}

async function buildSites() {
  allCookies = await chrome.cookies.getAll({});
  usedMap = await lastUsedMap(0);
  const map = new Map();
  for (const c of allCookies) {
    const base = baseDomain(c.domain);
    let s = map.get(base);
    if (!s) {
      s = { base, count: 0, signedIn: false, lastUsed: usedMap[base] || 0, big: isBigThree(c.domain), bigLabel: "" };
      if (s.big) s.bigLabel = bigThreeLabel(c.domain);
      map.set(base, s);
    }
    s.count += 1;
    if (c.httpOnly) s.signedIn = true;
    if (!s.big && isBigThree(c.domain)) { s.big = true; s.bigLabel = bigThreeLabel(c.domain); }
  }
  sites = [...map.values()].sort((a, b) => (b.lastUsed - a.lastUsed) || (b.count - a.count) || a.base.localeCompare(b.base));
}

async function renderStatus() {
  const { last_export } = await chrome.storage.local.get("last_export");
  const line = $("status-line");
  const detail = $("status-detail");
  if (!last_export) {
    line.textContent = "No export yet. Click Export now.";
    line.classList.remove("bad");
    detail.textContent = "";
    return;
  }
  const when = last_export.at ? new Date(last_export.at) : null;
  const ago = when ? relative(when.getTime()).replace("used ", "") : "";
  if (last_export.ok) {
    line.classList.remove("bad");
    const sitesPart = last_export.sites ? " from " + n(last_export.sites) + " sites" : "";
    line.textContent = "Last export: " + n(last_export.count) + " cookies" + sitesPart + ", " + ago + " (" + (last_export.reason || "run") + ").";
    const path = last_export.detail && last_export.detail.path ? last_export.detail.path : "";
    detail.textContent = path ? "Written to " + path : "";
  } else {
    line.classList.add("bad");
    line.textContent = "Last export failed " + ago + ".";
    const d = last_export.detail;
    detail.textContent = typeof d === "string" ? d : (d && d.error) ? d.error : "The native host did not answer. Run the register script for this extension ID, then reload the extension.";
  }
}

async function renderPreview() {
  const recent = await recentDomainSet(settings.recentDays);
  const { summary } = selectCookies(allCookies, settings, recent);
  const box = $("preview");
  $("preview-count").textContent = n(summary.exported) + " cookies";
  const parts = ["from " + n(summary.sites) + " sites will be in the next export, out of " + n(summary.total_in_chrome) + " in Chrome."];
  const held = [];
  if (summary.skipped_big_three) held.push(n(summary.skipped_big_three) + " Google, Meta or X");
  if (summary.skipped_by_site_rule) held.push(n(summary.skipped_by_site_rule) + " by the site rule");
  if (summary.skipped_not_recent) held.push(n(summary.skipped_not_recent) + " not used recently");
  if (held.length) parts.push("Held back: " + held.join(", ") + ".");
  if (settings.mode === "include" && settings.domains.length === 0) parts.push("Tick at least one site below.");
  $("preview-text").textContent = parts.join(" ");
  box.classList.toggle("empty", summary.exported === 0);
}

function renderModes() {
  for (const el of document.querySelectorAll('input[name="mode"]')) {
    el.checked = el.value === settings.mode;
  }
  $("skip-big-three").checked = Boolean(settings.skipBigThree);
  $("instant").checked = Boolean(settings.instantSync);
  const every = $("every");
  every.innerHTML = "";
  const choices = INTERVAL_CHOICES.includes(settings.everyMinutes) ? INTERVAL_CHOICES : [...INTERVAL_CHOICES, settings.everyMinutes].sort((a, b) => a - b);
  for (const m of choices) {
    const o = document.createElement("option");
    o.value = String(m);
    o.textContent = m < 60 ? m + " minutes" : (m / 60) + (m === 60 ? " hour" : " hours");
    if (m === settings.everyMinutes) o.selected = true;
    every.appendChild(o);
  }
}

async function renderRecentPills() {
  const wrap = $("recent-pills");
  wrap.innerHTML = "";
  for (const { days, label } of RECENT_CHOICES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pill";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(days === settings.recentDays));
    b.textContent = label;
    b.addEventListener("click", async () => {
      if (days > 0 && !(await hasHistoryPermission())) {
        try { await chrome.permissions.request({ permissions: ["history"] }); } catch (_) {}
      }
      await persist({ recentDays: days });
      await buildSites();
      await renderRecentPills();
      renderList();
    });
    wrap.appendChild(b);
  }
  const granted = await hasHistoryPermission();
  $("recent-hint").textContent = granted
    ? "Recent means visited in Chrome, or a cookie for the site changed, inside the window. History is read on this computer only."
    : "Chrome does not record when a cookie was created, so this reads your browsing history (asked for once, read locally) plus the cookie changes this extension has seen since it was installed." + (settings.recentDays ? " History was not granted, so only the cookie-change ledger is in use right now." : "");
}

function listTitle() {
  if (settings.mode === "include") return "Sites to include";
  if (settings.mode === "exclude") return "Sites to exclude";
  return "Sites in Chrome";
}

function renderListMeta() {
  $("list-title").textContent = listTitle();
  const picked = settings.domains.length;
  $("list-hint").textContent = settings.mode === "all"
    ? "Ticks only take effect with one of the pick modes above. " + n(sites.length) + " sites hold cookies right now."
    : n(picked) + " site" + (picked === 1 ? "" : "s") + " ticked. " + n(sites.length) + " sites hold cookies right now.";
  $("list").classList.toggle("dim", settings.mode === "all");
}

function visibleSites() {
  const q = $("search").value.trim().toLowerCase();
  const signedOnly = $("signed-in-only").checked;
  return sites.filter((s) => (!q || s.base.includes(q)) && (!signedOnly || s.signedIn));
}

function renderList() {
  const list = $("list");
  list.innerHTML = "";
  const shown = visibleSites();
  if (!shown.length) {
    const e = document.createElement("div");
    e.className = "empty-list";
    e.textContent = sites.length ? "No site matches." : "Chrome holds no cookies in this profile.";
    list.appendChild(e);
    $("list-foot").textContent = "";
    return;
  }
  const picked = new Set(settings.domains);
  const frag = document.createDocumentFragment();
  for (const s of shown) {
    const row = document.createElement("label");
    row.className = "rowitem";
    row.setAttribute("role", "listitem");
    const blocked = s.big && settings.skipBigThree;
    if (blocked) row.classList.add("blocked");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = picked.has(s.base);
    cb.disabled = blocked;
    cb.addEventListener("change", async () => {
      const set = new Set(settings.domains);
      if (cb.checked) set.add(s.base); else set.delete(s.base);
      await persist({ domains: [...set].sort() });
    });
    const dom = document.createElement("span");
    dom.className = "dom";
    dom.textContent = s.base;
    dom.title = s.base;
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = n(s.count) + (s.count === 1 ? " cookie" : " cookies") + " · " + relative(s.lastUsed);
    const tag = document.createElement("span");
    if (s.big) {
      tag.className = "tag big";
      tag.textContent = s.bigLabel + (blocked ? ", held back" : "");
    } else if (s.signedIn) {
      tag.className = "tag";
      tag.textContent = "looks signed in";
    } else {
      tag.className = "tag";
      tag.textContent = "";
    }
    row.append(cb, dom, meta, tag);
    frag.appendChild(row);
  }
  list.appendChild(frag);
  $("list-foot").textContent = n(shown.length) + " of " + n(sites.length) + " sites shown. Sorted by last use.";
}

async function bulk(tick) {
  const set = new Set(settings.domains);
  for (const s of visibleSites()) {
    if (s.big && settings.skipBigThree) continue;
    if (tick) set.add(s.base); else set.delete(s.base);
  }
  await persist({ domains: [...set].sort() });
  renderList();
}

function wire() {
  for (const el of document.querySelectorAll('input[name="mode"]')) {
    el.addEventListener("change", async () => {
      if (el.checked) { await persist({ mode: el.value }); renderList(); }
    });
  }
  $("skip-big-three").addEventListener("change", async (e) => {
    await persist({ skipBigThree: e.target.checked });
    renderList();
  });
  $("instant").addEventListener("change", (e) => persist({ instantSync: e.target.checked }));
  $("every").addEventListener("change", (e) => persist({ everyMinutes: Number(e.target.value) }));
  $("search").addEventListener("input", renderList);
  $("signed-in-only").addEventListener("change", renderList);
  $("select-shown").addEventListener("click", () => bulk(true));
  $("clear-shown").addEventListener("click", () => bulk(false));
  $("export-now").addEventListener("click", async () => {
    const btn = $("export-now");
    btn.disabled = true;
    btn.textContent = "Exporting…";
    try {
      await chrome.runtime.sendMessage({ type: "export-now", reason: "settings" });
    } catch (_) {}
    await renderStatus();
    await buildSites();
    renderList();
    await renderPreview();
    btn.disabled = false;
    btn.textContent = "Export now";
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.last_export) renderStatus();
  });
}

async function init() {
  $("version").textContent = "v" + chrome.runtime.getManifest().version;
  settings = await loadSettings();
  wire();
  renderModes();
  await renderStatus();
  await buildSites();
  await renderRecentPills();
  renderListMeta();
  renderList();
  await renderPreview();
}

init().catch((e) => {
  $("status-line").textContent = "Could not load settings: " + String(e);
  $("status-line").classList.add("bad");
});
