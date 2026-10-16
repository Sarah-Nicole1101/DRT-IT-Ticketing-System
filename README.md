# DRT Municipal IT Ticketing System

A maintainable Employee Portal prototype for the Municipality of Doña Remedios Trinidad, Bulacan.

## Current scope

- **Employee Portal:** working browser-based prototype (HTML, CSS, vanilla JavaScript).
- **IT Admin Portal:** separate application **not yet implemented**.
- **Backend:** Express.js API **not yet implemented**.
- **Database:** MySQL **not yet implemented**. Demo tickets and photos are stored in the current browser's IndexedDB.

## Run locally

From the repository root:

```bash
npm --prefix employee-portal run dev
npm --prefix employee-portal test
```

Open http://localhost:5173. Do not open `public/index.html` directly from disk: the page templates are fetched over HTTP.

## Folder map

| Location | Change here when... |
| --- | --- |
| `employee-portal/public/pages/` | Editing page text, HTML markup, form labels, or icons |
| `employee-portal/public/css/landing.css` | Editing the municipal PIN page appearance or photograph placement |
| `employee-portal/public/css/submit.css` | Editing submission form layout or photo-upload appearance |
| `employee-portal/public/css/success.css` | Editing Ticket ID confirmation and Copy ID styles |
| `employee-portal/public/css/track.css` | Editing ticket search, results, or progress modal appearance |
| `employee-portal/public/css/base.css` | Editing shared colors, header/footer, or common controls |
| `employee-portal/public/js/pages/` | Changing what buttons/forms do on a page |
| `employee-portal/public/js/services/access-service.js` | Changing **demo** PIN handling (not secure authentication) |
| `employee-portal/public/js/data/departments.js` | Changing the canonical 25 municipal office options |
| `employee-portal/public/js/data/ticket-store.js` | Changing browser IndexedDB storage / ticket reference generation |
| `employee-portal/public/js/lib/` | Changing reusable validation, formatters, and HTML template loading |
| `employee-portal/public/js/app.js` | Editing SPA navigation and route access behavior |
| `employee-portal/tests/` | Adding/updating automated checks |

See [the maintenance guide](employee-portal/docs/MAINTENANCE.md) for examples, data flow, and safe Git update steps.

## Current employee flow

1. Open `/` to enter the municipal demonstration PIN.
2. Submit a concern at `/submit` with a description, full name, municipal office, and at least one photo.
3. Receive a monthly-format reference such as `TKT-2026-10-001` and use Copy ID if desired.
4. Track an exact ticket reference or list tickets by selected municipal office; view the status and details dialog.

## Production warnings

**This is not a production municipal access system.** The demo PIN remains in browser JavaScript and can be discovered by anyone inspecting the source. The client-side route guard is not authorization. Demo records and photos are accessible only to the same browser; public ticket lookup and department-wide listing would expose employee information if deployed without access control. Before real deployment, implement server-side PIN verification, individual identity/access policies, rate limiting, shared MySQL storage, controlled photo access, privacy masking, and admin authentication.
