# Tasks

## 1. Storage & State Management

- [x] 1.1 Implement logic to extract, format, and save form values from DOM (excluding passwords) per pathname into `chrome.storage.local` and verify by checking the storage format in console
- [x] 1.2 Implement utility to fetch saved form data given origin + pathname and verify the retrieval works synchronously for UI components

## 2. Background and Navigation

- [x] 2.1 Update `wxt.config.ts` to include `webNavigation` permission and verify it applies correctly to manifest
- [x] 2.2 Add `chrome.webNavigation.onHistoryStateUpdated` and `chrome.tabs.onUpdated` listener in background script to detect navigation, updating badge visibility for the specific tab and verify badge toggles correctly

## 3. UI Component (Popup)

- [x] 3.1 Update `AutofillMode.vue` UI to include "Simpan form" and "Isi dari tersimpan" buttons (and disable "Isi dari tersimpan" if no data is found for current URL) and verify layout does not break
- [x] 3.2 Implement list view in `AutofillMode.vue` for saved fields allowing inline edit and deletion of individual fields (or clear all) and verify state persists to storage
- [x] 3.3 Add visual indicators (status text: "Tersimpan N field") in popup and verify it syncs automatically when new form is saved or tab changes

## 4. Sequential Form Fill logic

- [x] 4.1 Create `fillSavedForm` function in content script that matches fields based on id/name/testid/label/index priority and verify it selects the correct element
- [x] 4.2 Add sequential Promise-based iteration with `MutationObserver` wait timeout (10s) for disabled/hidden components and verify dependent fields correctly trigger after parents
- [x] 4.3 Trigger Vue/React reactivity events (input, change, blur) on each filled field and verify frameworks update their internal state
- [x] 4.4 Add visual highlight (Shadow DOM / outline) for fields successfully filled from saved state and verify layout remains intact
- [x] 4.5 Accumulate fill result (N out of M fields filled) and send message back to popup to display toast/alert notification and verify it displays the right count
