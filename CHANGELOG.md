# Changelog

## 1.2.1, 2026-09-25

- On brand with the Agent Ops Club: the club icon in the toolbar and on chrome://extensions, the settings page on the club palette (deep navy, cream, signal blue), the club lockup in its header, and a next step card that points at the club and the free plays for a signed in bot.

## 1.2.0, 2026-09-25

- Settings page (right click the icon, Options; opens by itself on first install). Every change saves as it is made and the page shows what the next export will carry.
- Site rules: every site, only the sites you tick, or every site except the ones you tick. Sites are grouped by domain with a cookie count, last use, search, and a switch for sites that look signed in.
- Google, Meta and X are held back by default, with a switch to change that.
- Only sites used recently: today, 7, 30 or 90 days. Built from browsing history (optional permission, asked for once, read locally) plus a ledger of cookie changes the extension records.
- Instant sync: a sign-in cookie changing on an allowed site triggers an export within about a minute, at most once every two minutes.
- The scheduled interval is a setting (5 minutes to 2 hours).
- `cookies.meta.json` now carries `filter` (the rules that applied) and `total_in_chrome`.
- The export keeps both key spellings for `httpOnly` and `sameSite` and adds `host_key`, so older injectors keep working.

## 1.1.1, 2026-09-23

- Agent notes: skip Google, Meta and X, and inject an allowlist.

## 1.1.0, 2026-09-23

- On-demand sync through `sync-request.flag`, and `agent/inject-cookies.py` for the bot side.

## 1.0.0, 2026-09-23

- The extension, the native host and the install scripts.
