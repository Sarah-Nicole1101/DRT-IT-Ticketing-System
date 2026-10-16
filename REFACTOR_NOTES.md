# Refactor notes

**Source:** The ZIP shared in this conversation. All existing official seal and municipal hall background assets were kept.

## Completed

- Moved the page markup from four `public/js/pages/*.js` controllers into six HTML templates (`landing`, `submit`, `success`, `no-submission`, `track`, `not-found`).
- Kept the ticket row and ticket details dialog as native `<template>` components within the tracking HTML and changed its controller to populate text safely.
- Added a single HTML template loader, with caching and explicitly named placeholder values.
- Made the router handle asynchronous template loading, stale navigation requests and page errors.
- Extracted the demo access check into a separate service (still entirely client-side and **not secure**).
- Extracted confirmation styles to `public/css/success.css` and grouped the shared/submission CSS comments for maintenance. Existing CSS declarations were preserved.
- Added template and rendering checks; increased the automated suite from 13 to 20 passing tests.
- Updated README, maintenance and formatting documentation to describe the current code accurately.

## Unchanged scope

- The visual page design, current images, PIN UI, eye toggle, existing photo workflow, IndexedDB database name/version, ticket reference format and ticket search logic were retained.
- No backend, admin UI, MySQL database or production authentication was implemented.

## How to verify locally

From the repository root:

```bash
npm --prefix employee-portal test
npm --prefix employee-portal run dev
```

Open `http://localhost:5173/`. Test the PIN page and eye toggle, one ticket submission, Copy ID, ID tracking and office tracking. Tickets remain local to the same browser's IndexedDB.

**Do not replace your working folder blindly:** extract separately, run the tests, compare any edits made since this ZIP was exported, and only then copy/commit the refactor.
