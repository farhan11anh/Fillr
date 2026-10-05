# Design

## Context

Fitur "Simpan form" memungkinkan state input form yang saat ini diisi (kecuali password) disimpan di `chrome.storage.local` dan di-restore kapan saja dengan satu klik. Untuk mengatasi permasalahan dependensi form kompleks (misal dropdown A mengatur ketersediaan dropdown B), pengisian ulang harus bersifat sekuensial dan asinkron. Ekstensi ini menggunakan arsitektur WXT dengan Vue 3 (Manifest V3).

## Goals / Non-Goals

**Goals:**
- Mengekstrak, merangkum, dan menyimpan state input form saat ini berlandaskan struktur halaman (origin + pathname).
- Mengisi form secara urut (sekuensial) dengan mekanisme _wait-for-ready_ berbasis `MutationObserver` (timeout 10 detik).
- Menampilkan update badge secara dinamis ketika navigasi SPA (`pushState`) terjadi ke halaman yang memiliki form tersimpan.
- Memungkinkan editing manual dari antarmuka popup.

**Non-Goals:**
- Enkripsi data tersimpan (disimpan plain text di storage lokal Chrome).
- Menyimpan password.
- Sinkronisasi awan atau ekspor impor struktur form.

## Decisions

1. **Struktur Kunci Penyimpanan `chrome.storage.local`:**
   * **Decision:** Menggunakan format kunci `fillkit_saved_form_${origin}${pathname}`.
   * **Data Format:** Object berisi list item: `[{ id, name, testId, label, type, index, value }]`.
   * **Rationale:** Memisahkan data per pathname mengizinkan SPA seperti `/users/new` dan `/products/edit` memiliki state mereka masing-masing tanpa konflik, sambil mengabaikan querystring yang sering berupa token acak/ID tracking (kebutuhan path dinamis `/users/123` mungkin memerlukan _wildcard_ di iterasi ke depan, saat ini kita fokus origin+pathname strict).

2. **Deteksi Route pada Single Page Applications (SPA):**
   * **Decision:** Menambahkan permission `webNavigation` dan merespon pada event `chrome.webNavigation.onHistoryStateUpdated` di background script.
   * **Rationale:** Pada SPA, `onUpdated` kadang tidak terpicu untuk sekadar perubahan `#` atau pushState HTML5. `webNavigation` menjamin deteksi yang komprehensif, memungkinkan background untuk meng-update badge browser action via `chrome.action.setBadgeText()`.

3. **Mekanisme Pengisian Sekuensial dan Asinkron (Wait-for-ready):**
   * **Decision:** Melakukan iterasi asinkron (menggunakan `for...of` dengan `await`) pada daftar field tersimpan. Untuk setiap iterasi:
     - Cari elemen berdasarkan hierarki pencocokan (id -> name -> testid -> label -> posisi index fallback).
     - Jika tidak ditemukan atau disabled/hidden, attach `MutationObserver` ke `document.body` dan gunakan timeout Promise (10 detik) yang resolve jika elemen menjadi _interactable_.
     - Jika timeout, skip field, dan catat laporannya.
   * **Rationale:** Menjamin Vue/React menangkap event (input, change, blur) yang me-render form dependent, tanpa meleset karena race condition (mengisi B saat dropdown B belum ter-populate dari API).

4. **Isolasi Penanda Visual (Highlighter):**
   * **Decision:** Menyuntikkan tag khusus berbasis Shadow DOM ke koordinat absolut elemen, atau menggunakan outline style berkelas spesifik `fillkit-highlight`.
   * **Rationale:** `outline: 2px solid #yourColor` lebih aman dan tidak mengganggu flow document.

## Risks / Trade-offs

- **Risk:** Path dinamis dengan ID seperti `/users/123` vs `/users/456` akan tersimpan terpisah.
  - **Mitigation:** Untuk saat ini diterima. Solusi masa depan: User bisa menambahkan regex pattern dari popup.
- **Risk:** `MutationObserver` memberatkan browser pada halaman rumit.
  - **Mitigation:** Observer dihentikan (`disconnect()`) segera setelah elemen aktif, dengan fallback timeout maksimal 10 detik per elemen.
- **Risk:** Label _translation_ (bahasa berubah) memutus pencocokan.
  - **Mitigation:** Algoritma mengandalkan atribut ID dan Name terlebih dahulu sebelum fallback ke Label text.
