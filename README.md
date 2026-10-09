# User Explorer — JavaScript Capstone

## Files
- `index.html` — app structure and comment box
- `style.css` — page styling
- `app.js` — API requests, pagination, virtualisation, closures, and safe comment rendering

## Run the app
1. Extract this ZIP.
2. Open the project folder in VS Code.
3. Run `index.html` with the Live Server extension, or use any local static web server.
4. An internet connection is required because users are fetched from DummyJSON.

## What the app demonstrates
- `fetch()` with `async` / `await`
- API response handling and JSON parsing
- Batch loading with `limit` and `skip`
- Virtualised user rows
- DOM manipulation
- Arrow functions and event callbacks
- A closure used for the Load More click handler
- Safer output using `textContent` instead of `innerHTML`

## Important pagination note
DummyJSON supports `limit` and `skip`. This project therefore uses **offset-based pagination**, not a true opaque cursor supplied by the server. The `nextCursor` variable stores the next numeric offset.

## XSS note
The comment box is the safe version. It displays comments with `textContent`, so input is treated as plain text rather than parsed as HTML. Do not add an intentionally vulnerable comment box to a real website.
