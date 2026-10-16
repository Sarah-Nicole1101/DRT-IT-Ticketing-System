# DRT Employee Portal — Frontend Prototype

Start locally:

```bash
npm run dev
```

Open http://localhost:5173. Run `npm test` for automated checks.

## Pages and modules

- `/` (also `/submit`) — concern submission form as the landing page (required description, name, office, image).
- `/submit/success` — shows the new Ticket ID, office, Pending status, and navigation links.
- `/track` — exact ID search OR office dropdown search, newest/oldest sort, ticket progress dialog.
- `public/js/data/ticket-store.js` — IndexedDB prototype storage. Handles ticket reference and migration from older demo tickets.

**Important:** Only the submitting browser stores the sample tickets. There is no database/backend connection yet, and the public results are unsuitable for real confidential municipal data until privacy requirements are resolved.

## Tech stack

HTML5 + CSS3 + Vanilla JavaScript, with planned Node.js + Express.js backend and MySQL database. IT Admin is an independent frontend application, not part of this portal.
