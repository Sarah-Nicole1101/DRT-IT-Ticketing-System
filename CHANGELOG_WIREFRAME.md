# Employee Portal Wireframe Update — 2026-10-15

## Approved requested changes

- Remove the separate Home page and "How it works" section. Render Submit Ticket immediately at `/`.
- Required submission fields: IT concern description, full name, municipal office, photo.
- Place the Track Ticket navigation action **below the form, aligned right**.
- Add searchable Ticket ID to the success confirmation; keep this distinct from the hidden internal UUID.
- Ticket tracking: Ticket ID returns exactly one ticket, municipal-office dropdown returns all that office's tickets.
- Support the original 25 DRT offices and Newest/Oldest sorting.
- Display result columns Ticket ID, Office, Status, Time Submitted.
- Open a modal on result selection with ID, time, current status, optional resolution duration, user description, and public IT note if available.
- Continue using only Pending, Resolved, Cancelled. No cooldown.
- Keep IT Admin separate from Employee Portal, with no admin link in public UI.

## Files changed

- `employee-portal/public/index.html`
- `employee-portal/public/js/app.js`
- `employee-portal/public/js/pages/submit.js`
- `employee-portal/public/js/pages/success.js`
- `employee-portal/public/js/pages/track.js`
- `employee-portal/public/js/data/ticket-store.js`
- `employee-portal/public/css/styles.css`
- `employee-portal/public/css/submit.css`
- `employee-portal/public/css/track.css`
- New: `employee-portal/tests/tracking-flow.test.mjs`
- Removed unused: `employee-portal/public/js/pages/home.js`, `employee-portal/public/css/home.css`
- Updated READMEs.

## Notes

- This changes the employee UI back to displaying public Ticket IDs based on the latest wireframe (superseding the earlier no-ticket-number requirement).
- New demo ticket references follow `DRT-IT-YYYY-XXXXXXXXXXXX` using random hexadecimal characters; this is **not** a security token.
- IndexedDB upgrade from v1 to v2 assigns references to older sample tickets without deleting their stored photos.
- Actual employees on separate devices cannot share tickets until the Node.js/MySQL backend is implemented.
- Before public deployment, decide what descriptions and IT notes may be disclosed by department-only searches, and add appropriate authorization/redaction.
- Do not force-push changes to GitHub; review changed files and run tests before committing to your current local repository.
