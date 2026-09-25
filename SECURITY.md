# Security

This bridge hands your live browser sessions to a machine that is not yours. That is the whole point of it, and it is also the whole risk, so the design is deliberately small and the boundaries are worth stating plainly.

**What runs here is local only.** The extension reads your cookies and passes them to the native host over Chrome's native messaging channel. The host writes one file to a folder on your own machine. Neither part opens a network connection, and neither has a server, an account, telemetry or an update check. Nothing here phones home.

**The file leaving your machine is your decision, not this code's.** The sync from that folder to your bot's computer is a job you ask your bot to run. This repository does not do it, does not know your bot, and holds no credential for it.

**Browsing history is optional and stays local.** The "only sites used recently" rule needs Chrome's history permission. The extension asks for it once, when you first pick a window, reads it on your own computer to work out which sites are in use, and writes none of it anywhere. Leave the rule on "Any time" and the permission is never requested.

**No password is read, written or moved.** The extension asks Chrome for cookies. It has no access to your password manager, and the native host never prints or logs a cookie value.

## What to report here

- A way for a web page, a site's script, or another extension to make this extension export to somewhere it should not, or to trigger an export it should not.
- A path by which the native host can be made to write outside its own sync folder, or to run anything.
- A native messaging registration that accepts an extension ID other than the one the user registered.
- A cookie value appearing in a log, a console line, a crash dump or any file other than the export itself.
- Anything in the install or register scripts that runs with wider permission than the file says it does.

Use GitHub's private vulnerability reporting on this repository (Security, then Report a vulnerability) rather than opening a public issue. If that is not available to you, use the contact address on https://www.reinventing.ai and put "agent-cookie-sync security" in the subject. Please give it a few days before disclosing.

## What is not a security issue

- That `cookies.json` signs in as you on every site in it. That is what it is for, it is said plainly in the README, and the guidance is to treat the sync folder like a password vault.
- That every bot on your account shares the machine you sync to, and so shares every login you sync. That is how those platforms work; sync from a Chrome profile holding only the accounts you would hand to an employee.
- That a site can see the session being used from a new place and sign you out or ask for a check. That is the site's protection working.

## Revoking, in three moves

1. Remove the extension on `chrome://extensions`.
2. Delete the sync folder: `%LOCALAPPDATA%\AgentCookieSync` on Windows, `~/.agentcookiesync` on macOS and Linux.
3. Change the password on anything you want signed out everywhere, which kills the session the cookie represents.
