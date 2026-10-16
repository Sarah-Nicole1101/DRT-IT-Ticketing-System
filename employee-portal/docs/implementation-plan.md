# Planned implementation sequence

1. Confirm current Home, Submit Concern, Submit Success and Track Tickets UX against the supplied Figma design.
2. Finalize public-data policy for employee names visible via department search. No authentication exists on the Employee Portal.
3. Build a **separate Node.js + Express.js backend** (`routes`, `controllers`, `services`, `models`, `middleware`, `validators`, `config`), using MySQL pooled connections and parameterized queries.
4. Build and run schema migrations for departments, tickets, attachments, status history, and admin users. Statuses are **Pending**, **Resolved**, **Cancelled** only. Ticket primary keys are internal; the Employee Portal never shows ticket numbers.
5. Replace `public/js/data/ticket-store.js` with an API-backed adapter and private file uploads, while preserving feature/page module interfaces.
6. Develop the **separate IT Admin Portal** with genuine authentication, role-based API permissions, status notes, resolved cost field, PDF reports and audit history.
7. Add end-to-end, accessibility, integration and security tests; deploy frontend on Netlify, backend and MySQL on suitable persistent hosting.

Temporary demo data is stored in the local browser IndexedDB and is not available from other devices or the Admin Portal.
