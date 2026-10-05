# Design

## Context

Lihat `proposal.md` untuk gambaran masalah kontras dan tata letak UI di *dark mode*. Desain saat ini mengandalkan nilai *hard-coded* hex di komponen yang menjadi tidak sinkron ketika background komponen dibalik warnanya untuk mode gelap, menimbulkan error keterbacaan serta tabrakan *z-index* dan teks yang keluar dari kotak di berbagai panel.

## Goals / Non-Goals

**Goals:**
- Membuat daftar inventarisasi seluruh panel UI yang terdampak dan wajib dicek/diperbaiki, meliputi:
  1. Main Popup Frame & Header
  2. Mode Switcher Menu
  3. Autofill Panel (Home)
  4. Daftar Field Form Tersimpan (Saved Form Editor)
  5. DevTools - LocalStorage Transfer Panel
  6. DevTools - JSON Viewer (Injected ke content)
  7. DevTools - Storage & Cookies Inspector
  8. DevTools - Meta Tag Checker (Bila ada)
  9. Injected Element: Highlighter box di DOM target (harus Shadow DOM)
- Mendefinisikan semantik *CSS Custom Properties* di root stylesheet (kemungkinan `assets/tailwind.css` atau `index.css`).
- Mengubah arsitektur _content script_ yang memproduksi elemen UI (misal: JSON Viewer dan highlighter box) agar selalu merender di dalam wadah `<fillkit-root>` bersistem `attachShadow({ mode: 'open' })`.

**Non-Goals:**
- Tidak ada penambahan fitur (pure refactoring style & UX).
- Tidak menggunakan *UI framework* eksternal baru (seperti Vuetify/Tailwind bila belum terpasang). Menggunakan framework yang sudah eksisting (Vue+WXT standar).
- **Opsi Masa Depan**: Penambahan tombol *Manual Theme Toggle* (saat ini sistem otomatis patuh pada `prefers-color-scheme`).

## Decisions

1. **Implementasi Design Token CSS Semantik:**
   * **Decision:** Membuat mapping warna `--text-primary`, `--bg-surface`, `--border-color`, `--accent-primary` di blok `:root` untuk tema terang dan blok `@media (prefers-color-scheme: dark)` untuk tema gelap.
   * **Rationale:** Dengan mengubah basis gaya secara global, seluruh komponen cukup menggunakan kelas CSS standar atau deklarasi styling yang memanggil variable `var(--bg-surface)`.
   * **Alternatif:** Memakai plugin Tailwind *dark mode*. Jika proyek memakai Tailwind, cukup menambahkan kelas `dark:bg-slate-900`. Namun user meminta untuk tidak menggunakan TailwindCSS. Jika sudah ada CSS *Vanilla*, variable CSS adalah yang terbaik.

2. **Perbaikan Tata Letak (Z-Index dan Text Overflow):**
   * **Decision:** Memperbaiki stack konteks. Menu dropdown harus memiliki z-index yang selaras, dan *container* teks dinamis (seperti URL) dikondisikan dengan `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;` dan menambahkan tag `title="...URL utuh..."`.
   * **Rationale:** Menghindari tampilan "pecah" akibat teks yang memanjang tak beraturan.

3. **Isolasi Shadow DOM Content Script:**
   * **Decision:** `createShadowRoot` digunakan di setiap content script `entrypoints/*.ts` yang merender UI ke web. Vue app di-mount ke elemen anak dari `shadowRoot`.
   * **Rationale:** Elemen injeksi (seperti JSON Viewer UI) sangat rentan hancur apabila _host website_ memiliki styling CSS radikal. Shadow DOM merangkum style-nya sendiri (dengan menginjeksi clone `style` tag di dalamnya).

## Risks / Trade-offs

- **Risk:** Isolasi Shadow DOM di WXT memerlukan konfigurasi styling yang agak spesifik (CSS hasil kompilasi perlu disuntik ke dalam shadow).
  - **Mitigation:** Menggunakan fungsionalitas WXT yang mendukung injeksi Vue Component ke dalam Shadow Root (seperti `createApp(...).mount(...)` di atas wadah dalam shadow node).
- **Risk:** Luput memperbaiki panel kecil atau state langka (misal state: kosong, error).
  - **Mitigation:** Disusun checklist pada `tasks.md` yang spesifik per komponen x tema untuk testing manual yang komprehensif.
