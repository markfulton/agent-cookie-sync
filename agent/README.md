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
