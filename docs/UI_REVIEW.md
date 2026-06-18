# UI Review

## Scope

Branch: `audit/140-browser-ui-release-readiness`

Reviewed routes:

- `/`
- `/demo`
- `/admin`
- `/company`
- `/status`

## Browser Tooling

The in-app browser connector was unavailable in this session with error `Browser is not available: iab`. Playwright was added as the browser verification path and configured to build and serve the production Next.js app on `127.0.0.1:3100`.

Command:

```bash
npm run test:e2e
```

Result:

- 12 passed
- Desktop Chromium route checks passed.
- Mobile Chromium route checks passed.
- Primary navigation reached every reviewed route.
- No captured page errors or browser console errors were observed by the test.

## Screenshot Evidence

Production-mode screenshots were captured at:

- `docs/ui-screenshots/chromium-desktop-home.png`
- `docs/ui-screenshots/chromium-desktop-demo.png`
- `docs/ui-screenshots/chromium-desktop-admin.png`
- `docs/ui-screenshots/chromium-desktop-company.png`
- `docs/ui-screenshots/chromium-desktop-status.png`
- `docs/ui-screenshots/chromium-mobile-home.png`
- `docs/ui-screenshots/chromium-mobile-demo.png`
- `docs/ui-screenshots/chromium-mobile-admin.png`
- `docs/ui-screenshots/chromium-mobile-company.png`
- `docs/ui-screenshots/chromium-mobile-status.png`

## Findings

- All reviewed routes load without runtime errors in Playwright.
- Top-level navigation is visible and functional.
- The testnet-only, mock-asset, no-real-funds disclaimer is visible across reviewed routes.
- Reviewed page copy does not present ORMB as a public RMB/CNH stablecoin, production payment product, or real-funds system.
- Dashboard layout reads as a restrained infrastructure demo rather than a marketing page.
- Admin and company dashboard table styling was tightened during review to avoid desktop overlap and improve mobile readability.
- Stale README/status copy from earlier bootstrap phases was updated to reflect the current static dashboard and browser verification state.

## Verdict

Browser UI review is acceptable for preparing `release/demo-v0`. The release branch must still provide final demo instructions, known limitations, release checklist, and human approval materials before any `dev` to `main` action.
