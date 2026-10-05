# Tasks

## 1. Design Tokens & Styling Foundation

- [x] 1.1 Declare semantic CSS Custom Properties (`--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`, `--danger`, `--success`) for both `:root` (light) and `@media (prefers-color-scheme: dark)` in main stylesheet and verify CSS compiles cleanly
- [x] 1.2 Run regex/grep over `src/` or `components/` to find and replace all hard-coded colors (e.g. `#FFF`, `#000`, `rgb(...)`) with the newly defined CSS variables and verify no hard-coded colors remain

## 2. Component Structure and Layout Refactor

- [x] 2.1 Refactor Main Popup Frame & Header layout: ensure consistent padding, fixed size, and readable titles (checking Light & Dark Mode) and verify visually
- [x] 2.2 Refactor Mode Switcher Menu: fix z-index issues and contrast for active/inactive states (checking Light & Dark Mode) and verify visually
- [x] 2.3 Refactor Autofill Panel (Home): fix text overlaps and ensure state indicators (e.g. disabled) are visible (checking Light & Dark Mode) and verify visually
- [x] 2.4 Refactor Saved Form Editor (Daftar Field Form Tersimpan): apply text ellipsis for long field values/names, ensuring tooltip text is present on hover (checking Light & Dark Mode) and verify visually
- [x] 2.5 Refactor DevTools - LocalStorage Transfer Panel: fix layout clipping for long keys/URLs with scroll or ellipsis handling (checking Light & Dark Mode) and verify visually
- [x] 2.6 Refactor DevTools - Storage & Cookies Inspector: fix any floating absolute overlapping elements (checking Light & Dark Mode) and verify visually

## 3. Shadow DOM UI Injection Isolation

- [x] 3.1 Update Content Script UI injection for JSON Viewer to use a Shadow DOM root container (e.g. `attachShadow`) and verify it renders immune to host site styles
- [x] 3.2 Update Content Script UI injection for Highlighter Box to use Shadow DOM or isolated unique CSS classes and verify it works without breaking the target site's layout
- [x] 3.3 Verify WCAG AA Contrast ratio on injected UI elements (JSON Viewer / Highlighters) in both Light & Dark Mode variants and verify visually

## 4. Final Review & Polish

- [x] 4.1 Perform global verification of text truncations across all text-heavy elements to ensure nothing is unreadably clipped (using `title` tooltips) and verify visually
- [x] 4.2 Verify focus rings on input fields and buttons are clear and accessible in both Dark and Light modes and verify visually
