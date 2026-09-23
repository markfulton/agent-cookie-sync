<p align="center">
  <a href="https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=hero"><img src="https://club.reinventing.ai/img/og/cookie-sync.jpg" width="820" alt="Chrome handing signed in sessions to Grok Bot and Muse"></a>
</p>

<h3 align="center">Give your cloud bot the sites you are already signed into.</h3>
<p align="center">A Chrome extension and a small native host. Local only. No password pasted anywhere.</p>

<p align="center">
  <a href="https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=nav-guide"><strong>The four step guide</strong></a>
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

This is the bridge. A Chrome extension reads the cookies of the sites you are signed into and hands them to a native host, which writes them to a folder on your own machine, every 15 minutes. Your bot syncs that folder and uses them in its browser. Setup is four steps, once.

No password ever moves. Chrome holds a session cookie for every site you are signed into, and the cookie is what proves you are you. Your passwords stay in your password manager.

Built by [Mark Fulton](https://www.reinventing.ai/?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync) of Reinventing.AI, founder of [Vibe Coding is Life](https://facebook.com/groups/vibecodinglife) (340,000+ members), from a setup he runs on his own machine.

## Install

You need Chrome and Python 3. Clone or download this repository first.

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

> Set a recurring sync every 15 minutes from that export folder to your computer, and use those cookies in your browser.

The [four step guide](https://club.reinventing.ai/cookie-sync?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=guide) has the same steps with every click path, the prompts to paste, and the jobs worth handing over once it works.

## Read this before you switch it on

- **The export file is your keys.** `cookies.json` signs in as you on every site in it. Treat the sync folder like a password vault.
- **Every bot on the account shares every login.** They share one cloud computer, so a login one bot gets, they all get.
- **Sync from a work profile.** Use a Chrome profile holding only the accounts you would hand to an employee. Not your personal one.
- **Revoking is three moves.** Remove the extension, delete the sync folder, change the password on anything you want signed out.

The extension and the host never touch the network. The sync to your bot's computer is the bot's job and your decision. Found a way to make this leak? [SECURITY.md](SECURITY.md), not a public issue.

## What is in here

```
extension/manifest.json        Manifest V3, cookies + alarms + nativeMessaging
extension/background.js        exports every 15 minutes and on every click
native-host/cookie_sync_host.py  writes the file, never prints a cookie value
Install.ps1                    Windows: copies the files, writes the launcher
Register-NativeHost.ps1        Windows: registers the host for your extension ID
register-mac-linux.sh          macOS and Linux: both steps in one run
```

<table>
<tr><td align="center" width="900">

<h2>The same bots run 8 open source AI Employees</h2>

<p>Each one is a folder of scheduled routines covering a whole business role, free on every plan. This bridge is how they reach your signed in accounts.</p>

<a href="https://club.reinventing.ai/?utm_source=github&utm_medium=readme&utm_campaign=cookie-sync&utm_content=cta-club"><strong>Learn more about the Agent Ops Club</strong></a>

<p><sub><b>Free account, no card.</b></sub></p>

</td></tr>
</table>

## FAQ

**Does this send my cookies anywhere?** Not from here. The extension and the host are local only. The sync to your bot is a separate job it runs at your say so.

**Does it work with anything other than Grok Bot and Muse?** Any agent that browses from a machine that is not yours and can sync a folder. Those two are what it is tested against.

**Do I need this for an agent on my own PC?** No. It already has your browser.

**What happens when I sign out of a site?** The next export carries no session for it and your bot loses access at the next sync.

**Can I use it for clients?** Yes, it is MIT. Just do not ship it under the club's name.

## License

MIT. Copyright (c) 2026 Mark Fulton. [LICENSE](LICENSE).

Built with Claude Code.
