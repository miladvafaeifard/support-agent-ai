#!/usr/bin/env bash
# Verifies the local stack end-to-end. Run after `pnpm dev` is up.
set -euo pipefail
API="${API:-http://localhost:3001}"

SUBJECT="${1:-How do I export my data?}"
BODY="${2:-Where is the export button?}"

echo "==> Ticket A: simple question (should attempt resolution, then escalate on low confidence)"
curl -fsS -X POST "$API/tickets" -H 'Content-Type: application/json' \
  -d "{\"customerEmail\":\"a@example.com\",\"subject\":\"$SUBJECT\",\"body\":\"$BODY\"}" && echo
  