# DRT Municipal IT Ticketing System

A modular IT concern reporting application for the Municipality of Doña Remedios Trinidad, Bulacan.

## Current status

- **Employee Portal:** frontend prototype (HTML, CSS, vanilla JavaScript).
- **IT Admin Portal:** separate application to be built later.
- **Backend:** Node.js + Express.js planned.
- **Database:** MySQL planned; current demonstration records use browser IndexedDB only.

## Current Employee Portal workflow

1. Open the deployed website: the **Submit Ticket form is the landing page**.
2. Enter a description, employee full name, municipal office, and required photo(s).
3. Submit and receive a unique public Ticket ID; the ticket begins in `Pending` status.
4. Choose **Track Ticket** at the bottom-right of the landing page.
5. Track by **exact Ticket ID** (one ticket) or by **municipal office** (all office tickets).
6. Sort results by newest/oldest and select a result to view the ticket progress, description, and IT note if available.

No end-user registration, password, or submission cooldown in this prototype. Available statuses: Pending, Resolved, Cancelled.

## Getting started

```bash
cd employee-portal
npm run dev
```

Then open `http://localhost:5173`. Run tests with `npm test` inside `employee-portal`.

## Architecture

- `employee-portal/public/js/pages/submit.js` — landing form and photo previews.
- `employee-portal/public/js/pages/success.js` — submission confirmation and Ticket ID.
- `employee-portal/public/js/pages/track.js` — exact-ID/office searches, sorting, progress dialog.
- `employee-portal/public/js/data/ticket-store.js` — browser IndexedDB data access (demo only).
- `employee-portal/public/js/data/departments.js` — 25 official municipal office options.
- `employee-portal/public/css/` — commented per-page and shared CSS.

## Privacy and production readiness

**This is not a production-ready municipal ticket service.** Browser-local demo tickets do not synchronize across employees, devices, or the Admin Portal. The requested department-wide public view can reveal private ticket descriptions or internal IT notes, so access restrictions, disclosure rules, redaction, secure administrator authentication, file protection, server validation, and abuse prevention must be defined and implemented before municipal deployment. A Ticket ID by itself is not proof of ticket ownership.

Do not use real sensitive information in the prototype.
