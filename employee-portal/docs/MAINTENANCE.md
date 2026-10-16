# Maintenance guide — DRT Employee Portal

## What belongs where?

| Want to change | Edit |
| --- | --- |
| Landing heading, icon, notices, PIN placeholder | `public/pages/landing.html` |
| Landing background, translucent form, typography | `public/css/landing.css` |
| PIN show/hide, form events and error display | `public/js/pages/landing.js` |
| Prototype PIN match and session flag | `public/js/services/access-service.js` (prototype only) |
| Submit form fields or explanations | `public/pages/submit.html` |
| Submit form validation rules | `public/js/lib/ticket-rules.js` |
| Photo preview, submit and save interactions | `public/js/pages/submit.js` |
| Photo storage and sequential reference generator | `public/js/data/ticket-store.js` |
| Confirm page markup, text or Copy ID label | `public/pages/success.html` |
| Copy ID button event logic | `public/js/pages/success.js` |
| Confirmation design | `public/css/success.css` |
| Tracking fields, notes, table and modal HTML | `public/pages/track.html` |
| Tracking queries, sorting, modal behavior | `public/js/pages/track.js` |
| Office names/codes | `public/js/data/departments.js` |
| Shared header/footer | `public/index.html` and `public/css/base.css` |
| Route mapping | `public/js/app.js` |

## Template rule

Page markup is ordinary HTML under `public/pages/`. The router fetches the HTML via `public/js/lib/template-loader.js`, then runs each page's `mount*()` function to attach events. Dynamic values are written as `{{officeOptions}}`, `{{reference}}`, etc., and filled in with explicit values from the corresponding page controller. Never put JavaScript code inside template placeholders. **Escape all untrusted values before substituting them into HTML**; only approved component renderers can output trusted HTML.

The Track Ticket page contains two native HTML `<template>` elements for the ticket row and details popup. Its controller clones those elements and assigns user content with `.textContent`, rather than mixing HTML and business logic in template strings.

## Ticket flow

1. `/` → `pages/landing.html` + `js/pages/landing.js` + `services/access-service.js`.
2. `/submit` → `pages/submit.html` + `js/pages/submit.js` + `lib/ticket-rules.js` + `data/ticket-store.js`.
3. `/submit/success` → `pages/success.html` + `js/pages/success.js` (reads recent submission from `sessionStorage`).
4. `/track` → `pages/track.html` + `js/pages/track.js` + `data/ticket-store.js`.

The app uses an asynchronous, race-guarded SPA router: navigating to a second page while a template is still loading will not restore stale first-page content. Backend services and the IT Admin app remain out of scope.

## Safe editing and testing

1. Save changes and run `npm --prefix employee-portal test` from repository root.
2. Start with `npm --prefix employee-portal run dev` and verify PIN toggle, PIN acceptance, new ticket, Copy ID, and Track Ticket search in the browser.
3. Review `git status` and `git diff` before committing. Push only after you have checked for secrets and verified behavior.
4. Never delete site data casually: IndexedDB contains the local demonstration tickets and photos.

## Known security limitations

The current PIN is a client-visible demo value, **not an authentication mechanism**. The current status page and department-wide ticket listing have no real user authorization. Client-side PIN validation, `sessionStorage`, and browser-based ticket storage must all be replaced/connected to a secure Express API and MySQL before municipal deployment. No backend or shared Admin Portal has been implemented in this refactor.
