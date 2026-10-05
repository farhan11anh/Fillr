# Proposal

## Why

Developer frontend sering kali membutuhkan beberapa tool berbeda dalam kesehariannya, seperti autofill form untuk pengujian (QA/Testing) dan tool inspeksi (storage, meta tags, dll). Menggabungkan kedua kebutuhan ini ke dalam satu ekstensi ("FillrKit") dengan kapabilitas *mode switcher* akan menghemat waktu dan meningkatkan produktivitas tanpa perlu meng-install banyak ekstensi terpisah. Scope change ini berfokus pada pembangunan fondasi ekstensi (Manifest V3, Vue 3 + Vite) dan pembuatan UI *switcher* mode dasar, sebelum logika spesifik per mode diimplementasikan.

## What Changes

- Scaffold proyek ekstensi baru menggunakan Manifest V3 dan Vue 3 + Vite.
- Konfigurasi `manifest.json` dengan permission minimum yang dibutuhkan (`storage`, `activeTab`, `scripting`).
- Pembuatan UI Popup yang ringan dengan *mode switcher* antara "Autofill" dan "Dev Tools".
- Implementasi penyimpanan state mode yang aktif ke dalam `chrome.storage.local`.
- Pembuatan struktur direktori modular (`src/modes/autofill`, `src/modes/devtools`) dengan UI placeholder.

## Capabilities

### New Capabilities
- `extension-core/mode-switcher`: Kapabilitas ekstensi untuk beralih antara mode Autofill dan Dev Tools, dan mengingat pilihan mode terakhir.

### Modified Capabilities
- (None)

## Impact

- Membentuk arsitektur awal dan fondasi proyek ekstensi Chrome (FillrKit).
- Mengatur baseline permission ekstensi.
- Membentuk pola modularisasi UI berdasarkan fitur/mode (Autofill dan Dev Tools) untuk mempermudah pengembangan lanjutan.
