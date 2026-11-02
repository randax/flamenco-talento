#!/usr/bin/env bash
# Boots the production build (`next start`) and checks that key routes return
# the expected status. `next build` and the unit tests cannot catch runtime
# failures in the proxy (locale redirect), the embedded Studio, or the
# Sanity-backed pages; this does. Run `pnpm build` first.
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:$PORT"
LOG="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/smoke-server.log"

pnpm start --port "$PORT" > "$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -s -o /dev/null "$BASE/robots.txt" && break
  sleep 1
done

failed=0
check() {
  local path="$1" expected="$2"
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")
  if [ "$status" = "$expected" ]; then
    echo "ok   $status $path"
  else
    echo "::error::$path returned $status, expected $expected"
    failed=1
  fi
}

check /                   307 # proxy redirects to the detected locale
check /no                 200
check /en                 200
check /no/nyheter         200
check /studio             200
check /sitemap.xml        200
check /robots.txt         200
check /no/does-not-exist  404

if [ "$failed" -ne 0 ]; then
  echo "--- server log ---"
  cat "$LOG"
  exit 1
fi
