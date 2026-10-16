# Employee Portal (frontend prototype)

Run from this folder with `npm run dev`. Open `http://localhost:5173`. Test with `npm test`.

- HTML structure: `public/pages/*.html`
- Landing PIN UI behavior: `public/js/pages/landing.js`; demo logic in `public/js/services/access-service.js`
- Ticket submission: `public/js/pages/submit.js`
- Confirmation / Copy ID: `public/js/pages/success.js`
- Track/search/dialog: `public/js/pages/track.js`
- Browser IndexedDB: `public/js/data/ticket-store.js`
- Styling: `public/css/{base,landing,submit,success,track}.css`
- Router: `public/js/app.js` (fetches HTML templates asynchronously)

**Demo limitations:** The PIN is not protected, and IndexedDB is not shared between devices or administrators. Do not store actual sensitive municipal data. See `docs/MAINTENANCE.md`.
