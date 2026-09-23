# Agent side: pull cookies and stay logged in

Syncing `cookies.json` to your bot's computer is only half the bridge. The bot's Chrome has its own cookie jar. After each pull, inject the file into that browser over Chrome DevTools Protocol.

## Requirements

- Agent Chrome launched with `--remote-debugging-port=PORT` (Grok Bot / Muse already do this).
- Python 3 + `websocket-client` (`pip install websocket-client`).
- This inject script connects with `suppress_origin=True`. That matters on Chrome 130+, which otherwise rejects CDP websockets unless Chrome was started with `--remote-allow-origins=*`.

## Inject after every sync

```bash
python3 agent/inject-cookies.py --cookies /path/to/cookies.json
```

Optional:

```bash
python3 agent/inject-cookies.py --cookies cookies.json --domains vercel.com,github.com
python3 agent/inject-cookies.py --port 9224 --dry-run
```

## On-demand fresh export

1. On the user's machine: `Request-Sync.ps1` (Windows) or `request-sync.sh` (macOS/Linux).
2. Wait until `cookies.meta.json` shows `reason: "request"` or a newer `exported_at` (usually under a minute).
3. Copy `cookies.json` + `cookies.meta.json` to the agent computer.
4. Run `inject-cookies.py`.

Do not commit `cookies.json`. Treat it like session credentials.

## Final instruction: skip Google, Meta and X

Do not use these cookies to sign in to a Google, Meta or X property. Gmail, Drive, Search Console, Google Ads, YouTube, Facebook, Instagram, WhatsApp, Meta Ads Manager, x.com.

A cloud browser arriving on those accounts is what their risk systems are built to catch. The cost is a security warning, a locked account or a disabled ad account, not a failed task. Their own MCP servers, plugins and official APIs connect the way the account expects, and they do the job better.

The safest way to hold that line is to inject an allowlist instead of everything:

```bash
python3 agent/inject-cookies.py --cookies cookies.json --domains canva.com,stripe.com,yourcrm.com,yourapp.com
```

Everything outside the big three is fair game, and it is most of what you actually work in: Canva, the CRM, the help desk, Stripe, the invoicing tool, the product's own admin dashboard, the project tracker.
