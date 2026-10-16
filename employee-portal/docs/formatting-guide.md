# Code formatting and debugging guide

## Organizing edits

Each Employee Portal page has one HTML template under `public/pages/`, one controller under `public/js/pages/`, and, where necessary, one CSS stylesheet under `public/css/`. Shared site-wide CSS goes in `base.css`; do not put unrelated page rules there.

CSS comments are grouped by component or section (rather than commenting every line), matching the preferred maintenance style. See [MAINTENANCE.md](MAINTENANCE.md) for the exact file to change for each feature.

## Formatting in VS Code

1. Open the extracted **repository root** folder in VS Code.
2. Install **Prettier – Code formatter** if not installed.
3. Format a file using `Shift+Alt+F` and save it.
4. Run `npm --prefix employee-portal test` from the repository root.

Prettier is an editor extension and is not needed at runtime.

## Debugging a page

1. For page text, form structure, or icons, open `public/pages/<page>.html`.
2. For user interactions, open `public/js/pages/<page>.js`.
3. For layout, open `public/css/<page>.css`; check the mobile media query as well.
4. For navigation/loading issues, check `public/js/app.js` and `public/js/lib/template-loader.js`.
5. Use Chrome DevTools Console for JavaScript errors, and the Network tab for missing `/pages/*.html` or asset requests.
6. Change one component at a time, run tests, and then verify behavior at `http://localhost:5173`.

## Good practices

- Keep stable input IDs and CSS class names unless their dependent controllers and tests are updated together.
- Never interpolate raw user input into HTML; escape it or assign via `textContent`.
- Avoid inline event attributes such as `onclick` in templates; attach handlers in the page controller.
- Do not hardcode real secrets in `public/` assets. The current municipal PIN is demo-only.
