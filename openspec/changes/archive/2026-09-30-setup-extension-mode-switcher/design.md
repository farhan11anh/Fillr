# Design

## Context

Proyek ini dibangun dari nol (scaffolding baru). Kita membutuhkan fondasi arsitektur ekstensi Chrome (Manifest V3) yang tangguh dan modular untuk FillrKit. Lihat proposal.md untuk motivasi selengkapnya.

## Goals / Non-Goals

**Goals:**
- Membuat setup dasar ekstensi Manifest V3 dengan build tool modern.
- Menyiapkan arsitektur folder modular berdasarkan kapabilitas/mode (`src/modes/autofill/`, `src/modes/devtools/`).
- Mengimplementasikan switcher state sederhana yang tersimpan di `chrome.storage.local`.

**Non-Goals:**
- Mengimplementasikan logika fitur Autofill dan Dev Tools yang sebenarnya.
- Menambahkan framework UI komponen yang berat (Vuetify, Quasar, dll) pada tahap ini.

## Decisions

**Decision 1: WXT vs Vue 3 + Vite + @crxjs**
- **Rationale**: Pengguna memberikan kebebasan memilih antara WXT atau @crxjs. WXT dirancang native sebagai meta-framework ekstensi dengan dukungan Vue 3, menyelesaikan banyak pain points (seperti HMR Service Worker di Manifest V3) yang sering ditemui pada @crxjs.
- **Decision**: Menggunakan **WXT dengan template Vue**. Jika nantinya dibutuhkan struktur custom yang sangat spesifik yang tidak didukung WXT, kita bisa eject atau turun kembali ke Vite murni.

**Decision 2: Manajemen State Switcher**
- **Rationale**: Mode ekstensi perlu disimpan antar-sesi. `chrome.storage.local` adalah pilihan standar untuk data yang tidak sinkron antar device dan berukuran kecil.
- **Decision**: Mode disimpan di `chrome.storage.local` dengan key `fillrkit_active_mode`. Di Vue, state ini akan dibaca secara asinkron saat `onMounted` dan memiliki fallback ke `'autofill'` jika null.

**Decision 3: Struktur Direktori**
- **Decision**: Menggunakan pendekatan feature-sliced.
  - `components/` (untuk UI umum: Switcher, Buttons)
  - `modes/autofill/` (khusus Autofill placeholder)
  - `modes/devtools/` (khusus DevTools placeholder)
- **Rationale**: Memastikan kode Autofill dan DevTools tidak tercampur seiring ekstensi berkembang.

## Risks / Trade-offs

- [Risk] HMR terkadang gagal saat struktur file di-refactor secara besar-besaran. → Mitigasi: Reload ekstensi dari `chrome://extensions` jika UI tampak stale.

## Open Questions
- Apakah kita akan membutuhkan state management global (seperti Pinia) di masa depan, atau cukup composable (Composition API) sederhana? Saat ini diasumsikan cukup composable.
