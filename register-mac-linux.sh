#!/usr/bin/env bash
# Agent Cookie Sync, install and register on macOS or Linux.
# Usage: bash register-mac-linux.sh <EXTENSION_ID>
# Run it once after loading the unpacked extension in Chrome.
set -euo pipefail
if [ "${1:-}" = "" ]; then
  echo "Usage: bash register-mac-linux.sh <EXTENSION_ID>   (the ID from chrome://extensions)"
  exit 1
fi
EXT_ID="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$HOME/.agentcookiesync"
mkdir -p "$ROOT/native-host"
cp "$HERE/native-host/cookie_sync_host.py" "$ROOT/native-host/"
chmod +x "$ROOT/native-host/cookie_sync_host.py"
PY="$(command -v python3 || command -v python || true)"
if [ -z "$PY" ]; then
  echo "Python 3 was not found. Install it, then run this script again."
  exit 1
fi
LAUNCHER="$ROOT/native-host/cookie_sync_host.sh"
printf '#!/usr/bin/env bash\nexec "%s" "%s"\n' "$PY" "$ROOT/native-host/cookie_sync_host.py" > "$LAUNCHER"
chmod +x "$LAUNCHER"

case "$(uname -s)" in
  Darwin) HOSTS="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts" ;;
  *)      HOSTS="$HOME/.config/google-chrome/NativeMessagingHosts" ;;
esac
mkdir -p "$HOSTS"
cat > "$HOSTS/com.agentopsclub.cookiesync.json" <<JSON
{
  "name": "com.agentopsclub.cookiesync",
  "description": "Agent Cookie Sync native host",
  "path": "$LAUNCHER",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://$EXT_ID/"]
}
JSON
echo "[agent-cookie-sync] Registered for extension $EXT_ID"
echo "[agent-cookie-sync] Sync folder: $ROOT"
echo "NEXT: reload the extension on chrome://extensions, then click its icon. The badge shows the cookie count."
