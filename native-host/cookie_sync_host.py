#!/usr/bin/env python3
"""Agent Cookie Sync native messaging host.

Chrome starts this program, sends one message (the cookie list) on stdin
and reads one reply on stdout. It writes two files to the sync folder:

  cookies.json       the cookies, for your agent to pull
  cookies.meta.json  when, how many, which rules applied, a domain sample

It never prints a cookie value and never touches the network.
"""
from __future__ import annotations

import json
import os
import struct
import sys
import time
from datetime import datetime, timezone


def sync_dir() -> str:
    local = os.environ.get("LOCALAPPDATA")
    if local:
        return os.path.join(local, "AgentCookieSync")
    return os.path.join(os.path.expanduser("~"), ".agentcookiesync")


def read_message():
    raw_len = sys.stdin.buffer.read(4)
    if not raw_len:
        return None
    (length,) = struct.unpack("<I", raw_len)
    data = sys.stdin.buffer.read(length)
    return json.loads(data.decode("utf-8"))


def send_message(msg: dict) -> None:
    encoded = json.dumps(msg).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()


def main() -> int:
    msg = read_message()
    if not msg:
        return 0
    out_dir = sync_dir()
    if msg.get("cmd") == "poll_request":
        os.makedirs(out_dir, exist_ok=True)
        flag = os.path.join(out_dir, "sync-request.flag")
        if os.path.exists(flag):
            try:
                os.remove(flag)
            except OSError:
                pass
            send_message({"ok": True, "export": True})
        else:
            send_message({"ok": True, "export": False})
        return 0
    os.makedirs(out_dir, exist_ok=True)
    cookies = msg.get("cookies") or []
    cookies_path = os.path.join(out_dir, "cookies.json")
    meta_path = os.path.join(out_dir, "cookies.meta.json")
    exported_at = msg.get("exported_at") or datetime.now(timezone.utc).isoformat()
    with open(cookies_path, "w", encoding="utf-8") as f:
        json.dump(cookies, f, ensure_ascii=False, separators=(",", ":"))
    domains = sorted({(c.get("domain") or "").lstrip(".") for c in cookies if c.get("domain")})
    meta = {
        "exported_at": exported_at,
        "exported_at_unix": time.time(),
        "cookie_count": len(cookies),
        "source": "agent-cookie-sync",
        "reason": msg.get("reason"),
        "total_in_chrome": msg.get("total_in_chrome"),
        "filter": msg.get("filter"),
        "out_dir": out_dir,
        "domain_sample": domains[:25],
        "domain_count": len(domains),
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    for p in (cookies_path, meta_path):
        try:
            os.chmod(p, 0o600)
        except OSError:
            pass
    send_message({"ok": True, "cookie_count": len(cookies), "path": cookies_path})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        try:
            send_message({"ok": False, "error": str(e)})
        except Exception:
            pass
        raise SystemExit(1)
