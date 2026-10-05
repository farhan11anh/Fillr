# Tasks

## 1. Project Initialization

- [x] 1.1 Scaffold proyek WXT dengan Vue template dan verifikasi package installation sukses
- [x] 1.2 Konfigurasi `wxt.config.ts` (atau ekuivalen) untuk mendeskripsikan permission Manifest V3 (`storage`, `activeTab`, `scripting`) dan verifikasi build `manifest.json` memuat permissions tersebut

## 2. Struktur Dasar dan UI Switcher

- [x] 2.1 Buat struktur direktori `src/components`, `src/modes/autofill`, dan `src/modes/devtools`, beserta komponen dummy (placeholder) untuk masing-masing mode. Verifikasi folder dapat di-import.
- [x] 2.2 Implementasikan UI popup utama (misalnya `entrypoints/popup/App.vue`) dengan tombol *switcher* untuk berpindah antara komponen Autofill dan DevTools. Verifikasi UI tampil dan komponen dummy berganti saat diklik.

## 3. Integrasi State Management

- [x] 3.1 Implementasikan *composable* untuk membaca dan menulis mode aktif ke `chrome.storage.local` dengan nilai fallback `"autofill"`. Verifikasi script berhasil menulis ke storage.
- [x] 3.2 Integrasikan *composable* ke UI Switcher sehingga popup selalu membaca state terakhir saat dibuka. Verifikasi behavior ini dengan reload popup secara manual.

## 4. Final Validation

- [x] 4.1 Jalankan ekstensi dalam mode *unpacked* di Chrome dan verifikasi tidak ada error di console dan semua skenario spec terpenuhi.
