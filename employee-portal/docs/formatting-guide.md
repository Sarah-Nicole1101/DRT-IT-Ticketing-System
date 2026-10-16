# Code Formatting & Debugging Guide

## Readable CSS

The four source CSS files under `public/css/` are formatted for maintainability. Every selector has its own block, each declaration uses a new line, and mobile rules are grouped in media queries. The underlying styles have **not** been changed.

## Enable automatic formatting in Visual Studio Code

1. Open the extracted project **folder** using `File > Open Folder` (so `.vscode/settings.json` is applied).
2. Open the Extensions sidebar (`Ctrl+Shift+X`) and install **Prettier – Code formatter** by Prettier.
3. Open any CSS/JS/HTML file and press `Shift+Alt+F` to format manually.
4. Use `Ctrl+S` to save. Workspace settings enable **Format On Save**.

**Note:** The Prettier extension is a VS Code extension, not a Node dependency. The website works without the extension; it only helps you keep source files readable.

## Where to find a style

- `public/css/base.css`: global colors, typography, header, navigation, footer, buttons, panels, responsive shared layout.
- `public/css/home.css`: homepage hero and feature cards.
- `public/css/submit.css`: concern submission form, photo preview, and confirmation page.
- `public/css/track.css`: office search, result filters, status cards, and tracking view.
- `public/css/styles.css`: central stylesheet imports; edit the specific page file rather than adding all rules here.

## When the design breaks

1. Identify the affected page and open its CSS file.
2. Press `Ctrl+F` and search for the component's CSS class, such as `.action-card`.
3. Press `F12` in your browser, select **Inspect**, click the broken element and review its **Styles** pane.
4. Check related `@media` blocks if the issue happens only on small screens.
5. Change **one rule at a time**, save, and refresh.
6. Run `npm test` after changing JavaScript logic.

**Production note:** Code formatting improves readability, but does not replace validation, access control, testing, or code review.
