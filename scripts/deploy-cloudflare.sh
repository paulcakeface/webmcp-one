#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

wrangler22() {
  npx -y -p node@22 -p wrangler@4 -c "wrangler $*"
}

pnpm install --frozen-lockfile
pnpm build
pnpm check

printf '\nChecking Cloudflare authentication...\n'
wrangler22 whoami

printf '\nDeploying state API first...\n'
wrangler22 'deploy --config wrangler.api.jsonc'
for app in broadband movers energy mission; do
  printf '\nDeploying %s...\n' "$app"
  wrangler22 "deploy --config wrangler.$app.jsonc"
done

printf '\nHealth checks...\n'
for url in \
  https://webmcp-one-api.paul-phillips1988.workers.dev/health \
  https://webmcp-one-broadband.paul-phillips1988.workers.dev/health \
  https://webmcp-one-movers.paul-phillips1988.workers.dev/health \
  https://webmcp-one-energy.paul-phillips1988.workers.dev/health \
  https://webmcp-one-mission.paul-phillips1988.workers.dev/health; do
  printf '%s  ' "$url"
  curl -fsS "$url"
  printf '\n'
done

printf '\nLocal artifact SHA-256:\n'
sha256sum dist/mission/worker.js dist/broadband/worker.js dist/movers/worker.js dist/energy/worker.js dist/api/worker.mjs
