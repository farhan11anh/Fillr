# Tasks

## 1. Core Logger & Message Handler

- [x] 1.1 Buat utilitas logger `src/utils/debug.ts` (mengimplementasikan `dlog`, pembatasan 500 ring buffer, fungsi redaction string, dan fungsi pembersih). Verifikasi modul berjalan dengan baik secara standalone dan membatasi ukuran array.
- [x] 1.2 Tambahkan `chrome.runtime.onMessage` listener khusus `GET_DEBUG_LOGS` di dalam *content script* `extractForm.content.ts` dan `fillSavedForm.content.ts` yang mengembalikan isi ring buffer format JSON. Verifikasi ekstensi tidak mengalami error koneksi saat menerima command tersebut.

## 2. Integrasi Logging pada Ekstraksi Form (Simpan Form)

- [x] 2.1 Modifikasi `extractForm.content.ts` untuk memeriksa state storage "Mode Debug" di awal proses; jika aktif, panggil `dlog` untuk merangkum total iterasi field, field yang diabaikan (dan alasannya), dan final pengenal yang disave. Verifikasi `console.groupCollapsed` memunculkan detail yang valid.

## 3. Integrasi Logging pada Pengisian Form (Isi Form)

- [x] 3.1 Modifikasi `fillSavedForm.content.ts` dan `fieldAdapters.ts` (terutama `QuasarSelectAdapter`) untuk memeriksa state storage "Mode Debug" dan menggunakan `dlog`. Rekam percobaan resolusi, pencarian jalur (contoh: fallback dari vue-instance ke click), dan durasi tiap tindakan. Verifikasi `dlog` berhasil mengganti nilai input dengan `[String length X]` atau mengabaikan nilai password sepenuhnya.

## 4. UI Popup & Clipboard

- [x] 4.1 Tambahkan UI Toggle Switch "Mode debug" pada `AutofillMode.vue` dan bind ke variable konfigurasi yang tersimpan di `chrome.storage.local`. Verifikasi toggle behavior tersimpan antar reload popup.
- [x] 4.2 Tambahkan tombol "Salin log debug" di `AutofillMode.vue` (muncul saat Mode debug aktif). Saat diklik, tombol tersebut menembak message `GET_DEBUG_LOGS` ke tab chrome yang aktif dan memanggil `navigator.clipboard.writeText()` dari response. Verifikasi clipboard menampung JSON log yang dicopy dan muncul toast konfirmasi berhasil.
