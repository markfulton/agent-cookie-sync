// Agent Cookie Sync. Reads every cookie Chrome holds and hands the list to
// the native host on this computer, which writes it to a local folder.
// Nothing leaves this machine from here. The badge on the icon shows the
// count from the last export, or ! when the host could not be reached.

const NATIVE_HOST = "com.agentopsclub.cookiesync";
const ALARM = "agent-cookie-sync";
const EVERY_MINUTES = 15;

async function exportCookies(reason) {
  const cookies = await chrome.cookies.getAll({});
  const payload = {
    reason,
    exported_at: new Date().toISOString(),
    cookie_count: cookies.length,
    cookies: cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expirationDate ?? null,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      session: c.session,
      storeId: c.storeId
    }))
  };
  try {
    const response = await chrome.runtime.sendNativeMessage(NATIVE_HOST, payload);
    const ok = Boolean(response && response.ok);
    await chrome.storage.local.set({
      last_export: { at: payload.exported_at, count: payload.cookie_count, ok, detail: response || null }
    });
    await chrome.action.setBadgeBackgroundColor({ color: ok ? "#1f7a4d" : "#a33a3a" });
    await chrome.action.setBadgeText({ text: ok ? String(payload.cookie_count) : "!" });
    return response;
  } catch (err) {
    await chrome.storage.local.set({
      last_export: { at: payload.exported_at, count: payload.cookie_count, ok: false, detail: String(err) }
    });
    await chrome.action.setBadgeBackgroundColor({ color: "#a33a3a" });
    await chrome.action.setBadgeText({ text: "!" });
    throw err;
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM, { periodInMinutes: EVERY_MINUTES });
  try { await exportCookies("installed"); } catch (_) {}
});

chrome.runtime.onStartup.addListener(async () => {
  const existing = await chrome.alarms.get(ALARM);
  if (!existing) await chrome.alarms.create(ALARM, { periodInMinutes: EVERY_MINUTES });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM) return;
  try { await exportCookies("alarm"); } catch (_) {}
});

chrome.action.onClicked.addListener(async () => {
  try { await exportCookies("click"); } catch (_) {}
});
