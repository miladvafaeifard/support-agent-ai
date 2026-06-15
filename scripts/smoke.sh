#!/usr/bin/env bash
# Verifies the local stack end-to-end. Run after `pnpm dev` is up.
set -euo pipefail
API="${API:-http://localhost:3001}"

echo "==> Health check"
curl -fsS "$API/health" && echo

echo "==> Ticket A: simple question (should attempt resolution, then escalate on low confidence)"
curl -fsS -X POST "$API/tickets" -H 'Content-Type: application/json' \
  -d '{"customerEmail":"a@example.com","subject":"How do I export my data?","body":"Where is the export button?"}' && echo

echo "==> Ticket B: angry refund (should skip straight to human via escalation)"
curl -fsS -X POST "$API/tickets" -H 'Content-Type: application/json' \
  -d '{"customerEmail":"b@example.com","subject":"Refund now","body":"This is unacceptable, I want a refund immediately, worst service ever."}' && echo

echo
echo "==> Now open the queue dashboard to watch jobs flow:"
echo "    $API/admin/queues"
