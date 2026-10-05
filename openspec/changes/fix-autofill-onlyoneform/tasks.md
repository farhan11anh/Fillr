# Tasks

## 1. Pembaruan Struktur Data `SavedFormField`

- [x] 1.1 Modifikasi interface `SavedFormField` di `utils/savedForm.ts` dengan menambahkan tipe opsional `formIndex?: number`. Verifikasi tidak ada error *type checking* TypeScript saat menjalankan build (`npm run build`).

## 2. Modifikasi Alur Ekstraksi (`extractFormFields`)

- [x] 2.1 Di dalam fungsi `extractFormFields` (`utils/savedForm.ts`), tambahkan pencarian semua elemen `<form>` sebelum perulangan iterasi elemen input (`const forms = Array.from(document.querySelectorAll('form'))`). Verifikasi variabel array forms berisi list yang tepat pada waktu runtime ekstensi (melalui log console jika debug mode aktif).
- [x] 2.2 Pada blok perulangan pencarian informasi untuk tiap `fieldRoot`, hitung nilai `formIndex` dengan mencari elemen parent form (menggunakan `.closest('form')`) lalu mencari *index*-nya di dalam array `forms` (gunakan `-1` jika tidak ada). Masukkan `formIndex` ke hasil object penyimpan field. Verifikasi ekstensi dapat menghasilkan payload JSON ke `chrome.storage` yang berisi property `formIndex` saat memencet "Simpan form".

## 3. Modifikasi Alur Pengisian (`fillSavedForm`)

- [x] 3.1 Di dalam file `entrypoints/fillSavedForm.content.ts`, modifikasi bagian `getElement(field)` untuk mengambil array semua elemen `<form>` terlebih dahulu. Lakukan modifikasi agar `rawInputs` di-filter hanya menyisakan elemen yang nilai `el.closest('form')` nya sesuai dengan node `<form>` di `forms[field.formIndex]`, jika `field.formIndex` lebih dari atau sama dengan 0. Verifikasi bahwa jika formIndex tidak tersedia (misal data lama), filtering dilewati untuk kompatibilitas ke belakang (backward compatibility).
- [x] 3.2 Lakukan verifikasi integrasi final dengan menavigasi browser ke halaman pengujian yang memiliki dua `<form>` identik namun terpisah. Uji klik tombol "Isi form", pastikan masing-masing form terisi secara akurat tanpa *cross-over* alias tumpang tindih input dengan `scoreResolver` yang salah menebak target form.
