#!/usr/bin/env bash
# Request an immediate cookie export (macOS / Linux).
set -euo pipefail
OUT="${AGENT_COOKIE_SYNC_DIR:-$HOME/.agentcookiesync}"
mkdir -p "$OUT"
FLAG="$OUT/sync-request.flag"
date -u +%Y-%m-%dT%H:%M:%SZ > "$FLAG"
chmod 600 "$FLAG" 2>/dev/null || true
echo "Requested sync: $FLAG"
echo "Extension should export within ~1 minute if Chrome is running."
