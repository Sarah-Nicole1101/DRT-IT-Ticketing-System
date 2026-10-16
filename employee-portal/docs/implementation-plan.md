# Next implementation phases (not yet built)

The current Employee Portal is a **browser-local frontend prototype**. This document describes future work, not already implemented capabilities.

1. Finalize an approved access/privacy model for municipal employees and the IT Admin Portal. The existing shared demo PIN is not a secure identity method.
2. Build a **separate Node.js + Express backend** with routes, validation, controllers, services, database repositories and access middleware.
3. Create MySQL migrations for offices, tickets, uploaded photos/attachments, status events, audit history, administrative users and monthly Ticket ID counters. Maintain unique IDs of the form `TKT-YYYY-MM-XXX` centrally.
4. Replace browser-only `public/js/data/ticket-store.js` operations with an authenticated API service. Do not expose full ticket descriptions or IT notes merely because someone knows a ticket number or office.
5. Move municipal PIN verification to the server, hash/store it appropriately, rate-limit failed attempts, and issue server-managed sessions with explicit route permissions. Individual employee identity may require a stronger authentication mechanism.
6. Develop the separate **IT Admin Portal** with proper authentication, restricted department access, status changes, controlled public notes, secure photo access, reporting and audit trails.
7. Add functional, integration, browser, accessibility and security tests before production deployment.

Current statuses: **Pending**, **Resolved**, **Cancelled**. Employee confirmation and tracking screens display public Ticket IDs in the existing prototype; real production disclosure rules must be approved before deployment.
