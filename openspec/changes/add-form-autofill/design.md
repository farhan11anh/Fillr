# Design

## Context

Kita sedang mengembangkan `FillrKit`, ekstensi Chrome berbasis Manifest V3 dengan WXT dan Vue 3. Bagian dari arsitektur ini sudah memiliki dukungan mode operasi (Autofill dan Dev Tools) dengan pengaturan status di `chrome.storage.local`. Modul Autofill membutuhkan cara untuk mendeteksi field input di halaman aktif, menghasilkan data dummy fiktif (Indonesia/Inggris), serta memicu mekanisme update state untuk framework SPA (Vue, React, Angular).

## Goals / Non-Goals

**Goals:**
- Mengeksekusi script pengisian pada halaman aktif secara aman dan efisien menggunakan permission `activeTab`.
- Mengimplementasikan sistem heuristik ringan untuk mencocokkan input form berdasarkan kombinasi atribut DOM (name, id, type, label).
- Menyediakan mekanisme update `value` yang mem-bypass _overridden setter_ (contoh pada React) sehingga `v-model`/controlled state ter-update sempurna.

**Non-Goals:**
- Pembuatan AI atau ML untuk menebak secara dinamis field form yang tidak standar.
- Menyimpan data riil pengguna atau auto-submit form.

## Decisions

### 1. Mekanisme Injeksi Content Script
- **Keputusan:** Menggunakan mekanisme `chrome.scripting.executeScript` secara on-demand (dari background atau popup), alih-alih meletakkan global content script di `manifest.json`.
- **Rasionalisasi:** Dengan fitur on-demand, kode heuristik dan pengisian hanya berjalan saat _user_ secara sadar memicu tombol "Fill" atau shortcut. Ini jauh lebih ringan dan aman (meminimalkan overhead memori pada setiap tab yang dibuka).
- **Alternatif:** Content script global (terlalu berat karena selalu jalan di setiap halaman).

### 2. Pembangkitan Data (Data Generator)
- **Keputusan:** Membuat generator statis minimalis untuk profil data (misal list nama Indonesia, format email, fungsi acak angka untuk NIK/Telepon).
- **Rasionalisasi:** Library seperti `@faker-js/faker` sangat besar dan akan memperbesar ukuran file ekstensi secara tidak proporsional. Membuat generator fungsi utilitas mandiri sudah cukup untuk menghasilkan NIK palsu dan nomor rekening.

### 3. Kompatibilitas Framework (Reactivity)
- **Keputusan:** Menulis nilai dengan native setter `HTMLInputElement.prototype.value` lalu men-dispatch `input`, `change`, dan `blur` event dengan `{ bubbles: true }`.
- **Rasionalisasi:** React menahan setter pada elemen DOM, sehingga manipulasi langsung pada properti `element.value = "xyz"` tidak selalu memicu re-render. Native setter _bypasses_ proteksi ini dan memastikan framework SPA menangkap perubahannya.

## Risks / Trade-offs

- **[Risk]** Field dalam *Shadow DOM* atau *Iframe* lintas-domain tidak terdeteksi oleh script biasa.
  - **Mitigation**: Versi awal membatasi dukungan hanya pada elemen form di *Light DOM* utama. Hal ini cukup untuk 90% kasus penggunaan form standar.
- **[Risk]** Penamaan atribut form (name/id) yang diacak otomatis (obfuscated) oleh bundler seperti Webpack/Vite.
  - **Mitigation**: Heuristik tidak hanya melihat `id` atau `name`, tetapi juga mencari teks pada elemen `<label>` yang terhubung dan atribut `placeholder`.
