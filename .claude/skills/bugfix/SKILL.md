---
name: bugfix
description: Check Sentry errors, Axiom logs, and other monitoring sources for bugs, then fix them with regression tests
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Fix — Automated issue detection and resolution

Check all monitoring sources for issues affecting the coffeeandai app, then fix them.

## Steps

1. **Check Sentry for unresolved errors:**
   ```bash
   export SENTRY_AUTH_TOKEN="$(grep SENTRY_AUTH_TOKEN .env 2>/dev/null | cut -d= -f2 || echo '')"
   curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
     "https://sentry.io/api/0/projects/nexxt-wh/coffeeandai/issues/?query=is:unresolved&limit=25"
   ```
   - For each issue, fetch the latest event's stack trace to understand the root cause
   - API: `https://sentry.io/api/0/issues/{issue_id}/events/latest/`

2. **Check Axiom for errors and performance issues:**
   ```bash
   export AXIOM_TOKEN="$(grep AXIOM_TOKEN .env 2>/dev/null | cut -d= -f2 || echo '')"
   ```
   - Query the `vercel` dataset filtered to `vercel.projectName == "coffeeandai"`
   - Check for `level == "error"` logs in the last hour
   - Check for routes with avg response time > 1000ms
   - Check for routes with 500 status codes
   - API endpoint: `https://api.axiom.co/v1/datasets/vercel/query`

3. **For each issue found:**
   - Diagnose the root cause by reading relevant source files
   - Implement the fix
   - Add a regression test (E2E in `web/e2e/` or unit test in `web/__tests__/`)
   - Run `npx playwright test` from `web/` to verify

4. **After fixing:**
   - Resolve fixed Sentry issues via API:
     ```bash
     curl -X PUT -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
       -H "Content-Type: application/json" \
       "https://sentry.io/api/0/projects/nexxt-wh/coffeeandai/issues/" \
       -d '{"id": ["ISSUE_ID"], "status": "resolved"}'
     ```

5. **Report summary** of what was found and fixed.

## Credentials

Tokens should be in `.env` file or environment. If not found, check Vercel env vars:
- `SENTRY_AUTH_TOKEN` — personal token with admin scope
- `AXIOM_TOKEN` — org token with read access (dataset: `vercel`)

## Future integrations

- Linear (when connected): check assigned issues
- Vercel deployment logs: check for build failures
