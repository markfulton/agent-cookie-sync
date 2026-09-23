<p align="center">
  <a href="https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=hero"><img src="https://club.reinventing.ai/img/og/cookie-sync.jpg" width="820" alt="Chrome handing signed in sessions to Grok Bot and Muse"></a>
</p>

<h3 align="center">Give your cloud bot the sites you are already signed into.</h3>
<p align="center">A Chrome extension and a small native host. Local only. No password pasted anywhere.<br>Hand the folder to your bot and it installs itself.</p>

<p align="center">
  <a href="https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=nav-guide"><strong>The setup and the plays</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="https://club.reinventing.ai/ai-employees?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=nav-employees"><strong>8 AI Employees</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="https://club.reinventing.ai/?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=nav-club"><strong>Agent Ops Club</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="https://club.reinventing.ai/events?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=nav-sessions"><strong>Live sessions</strong></a>
</p>

<p align="center">
  <img alt="Stars" src="https://img.shields.io/github/stars/markfulton/agent-cookie-sync?style=flat-square&color=E3B341&logo=github&logoColor=white&label=Stars">
  <img alt="MIT license" src="https://img.shields.io/badge/License-MIT-3FB950?style=flat-square">
  <img alt="Chrome Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?style=flat-square&logo=googlechrome&logoColor=white">
  <img alt="Python 3" src="https://img.shields.io/badge/Python_3-native_host-3776AB?style=flat-square&logo=python&logoColor=white">
  <img alt="Windows, macOS and Linux" src="https://img.shields.io/badge/Windows_macOS_Linux-ready-2B2B2B?style=flat-square">
  <img alt="Local only" src="https://img.shields.io/badge/Network_calls-none-0B7FC7?style=flat-square">
</p>

<p align="center">
  ⭐ <em>Found this useful? Star the repo. It takes a second and helps the next person find it.</em>
</p>

## What this is

Grok Bot and Muse browse from a cloud computer of their own. Fresh browser, no sessions, signed out of everything you use, so the first piece of real work hits a login wall.

This is the bridge. A Chrome extension reads the cookies of the sites you are signed into and hands them to a native host, which writes them to a folder on your own machine, every 15 minutes (or on demand). Your bot syncs that folder, then injects the cookies into its own Chrome over DevTools Protocol so the window is actually signed in. Folder sync alone is not enough. Setup is one prompt to your bot, or a few steps by hand.

No password ever moves. Chrome holds a session cookie for every site you are signed into, and the cookie is what proves you are you. Your passwords stay in your password manager.

Built by [Mark Fulton](https://www.reinventing.ai/?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync) of Reinventing.AI, founder of [Vibe Coding is Life](https://facebook.com/groups/vibecodinglife) (340,000+ members), from a setup he runs on his own machine.

## Install

You need Chrome and Python 3.

### The easy way: let your bot do it

Download this repository (**Code**, **Download ZIP**) or clone it, extract it somewhere you will find again, then paste this to Grok Bot or Muse:

```
Please install and set up the Agent Cookie Sync Chrome extension and native host I just extracted to my computer's Downloads folder. I'll give you the extension id, tell me where to find it. Then set a recurring sync every 15 minutes from the cookie export folder to your computer, inject those cookies into your Chrome via CDP after each pull (see agent/inject-cookies.py), and support on-demand sync with Request-Sync.ps1 / request-sync.sh.
```

That one prompt does the whole setup, the recurring sync included. It stops once, to walk you through loading the extension in Chrome and to take the extension ID from you, because that part only you can do.

### By hand

**Windows**

```powershell
powershell -ExecutionPolicy Bypass -File Install.ps1
```

Then load the extension: Chrome, `chrome://extensions`, Developer mode on, **Load unpacked**, pick the `extension` folder the script printed, and copy the extension ID from its card. Register the host with that ID:

```powershell
powershell -ExecutionPolicy Bypass -File Register-NativeHost.ps1 -ExtensionId YOUR_EXTENSION_ID
```

**macOS and Linux**

Load the extension the same way, copy the ID, then one script does the rest:

```bash
bash register-mac-linux.sh YOUR_EXTENSION_ID
```

**Both**

Reload the extension on `chrome://extensions`, then click its toolbar icon once. The badge turns into your cookie count and `cookies.json` lands in the sync folder: `%LOCALAPPDATA%\AgentCookieSync` on Windows, `~/.agentcookiesync` elsewhere.

Last, tell your bot once:

> Set a recurring sync every 15 minutes from that export folder to your computer, inject the cookies into your Chrome with agent/inject-cookies.py after each pull, and wire on-demand sync via Request-Sync.ps1 / request-sync.sh.

The [setup page](https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=guide) has the same four steps with every click path, free and with no account.

## Read this before you switch it on

- **The export file is your keys.** `cookies.json` signs in as you on every site in it. Treat the sync folder like a password vault.
- **Every bot on the account shares every login.** They share one cloud computer, so a login one bot gets, they all get.
- **Sync from a work profile.** Use a Chrome profile holding only the accounts you would hand to an employee. Not your personal one.
- **Revoking is three moves.** Remove the extension, delete the sync folder, change the password on anything you want signed out.

The extension and the host never touch the network. The sync to your bot's computer is the bot's job and your decision. Found a way to make this leak? [SECURITY.md](SECURITY.md), not a public issue.

## What is in here

```
extension/manifest.json          Manifest V3, cookies + alarms + nativeMessaging
extension/background.js          exports every 15 minutes, on click, and on demand
native-host/cookie_sync_host.py  writes the file; also answers poll_request
Request-Sync.ps1                 Windows: drop sync-request.flag for a fresh export
request-sync.sh                  macOS/Linux: same on-demand flag
agent/inject-cookies.py          agent computer: inject cookies.json into Chrome via CDP
agent/README.md                  how the bot pulls, injects, and requests a fresh export
Install.ps1                      Windows: copies the files, writes the launcher
Register-NativeHost.ps1          Windows: registers the host for your extension ID
register-mac-linux.sh            macOS and Linux: both steps in one run
```

<table>
<tr><td align="center" width="900">

<h2>Now the harder question: what do you hand it?</h2>

<p>A bot signed in as you is worth exactly the work you give it. The play book is eight prompts I run on my own accounts, each one written for a browser that is already logged in: the inbox cleared to drafts, rankings turned into a content plan, yesterday's ad spend put next to real revenue, every stalled deal swept and followed up, the support queue triaged angriest first.</p>

<p>Past that, the <strong>8 open source AI Employees</strong> run work like it on a schedule instead of on your say so. One folder of routines per business role, free on every plan, and this bridge is how they reach your accounts.</p>

<a href="https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=cta-plays#steps"><strong>Get the 8 plays</strong></a>
&nbsp;&nbsp;&bull;&nbsp;&nbsp;
<a href="https://club.reinventing.ai/ai-employees?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=cta-employees"><strong>Meet the 8 AI Employees</strong></a>

<p><sub><b>Free account, no card.</b></sub></p>

</td></tr>
</table>

## Stay logged in on the bot

After your bot copies `cookies.json`, it must inject into its own Chrome. Use `agent/inject-cookies.py` against a browser that has `--remote-debugging-port` (Grok Bot and Muse already do). The script uses Chrome DevTools `Storage.setCookies` and never prints cookie values.

### On-demand sync

Need a fresher session than the 15-minute alarm?

1. Run `Request-Sync.ps1` on Windows, or `request-sync.sh` on macOS/Linux.
2. Within about a minute the extension exports and clears `sync-request.flag`.
3. Your bot pulls the folder and runs `inject-cookies.py` again.

You can also click the extension icon anytime for an immediate export.

## FAQ

**Does this send my cookies anywhere?** Not from here. The extension and the host are local only. The sync to your bot is a separate job it runs at your say so.

**Does it work with anything other than Grok Bot and Muse?** Any agent that browses from a machine that is not yours and can sync a folder. Those two are what it is tested against.

**Do I need this for an agent on my own PC?** No. It already has your browser.

**Why is my bot still on a login page after sync?** Syncing the folder is not enough. The bot has to inject `cookies.json` into its Chrome (see `agent/inject-cookies.py`). Then reload the site.

**What happens when I sign out of a site?** The next export carries no session for it and your bot loses access at the next sync.

**Can I use it for clients?** Yes, it is MIT. Just do not ship it under the club's name.

## License

MIT. Copyright (c) 2026 Mark Fulton. [LICENSE](LICENSE).

Built with Claude Code.
