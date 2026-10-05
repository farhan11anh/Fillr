# Tasks

## 1. Refactoring Arsitektur Adapter

- [x] 1.1 Buat antarmuka (interface) `FieldAdapter` dengan fungsi `{ detect, read, write }` dan sistem iterasi prioritas adapter pada file utilitas baru (`utils/fieldAdapters.ts`) dan verifikasi tipe TypeScript compile tanpa error
- [x] 1.2 Modifikasi `extractFormFields` di `utils/savedForm.ts` agar memanggil method `detect` dan `read` dari list adapter dan verifikasi nilai diekstrak melalui console/storage inspeksi saat simpan form
- [x] 1.3 Modifikasi `entrypoints/fillSavedForm.content.ts` agar memanggil method `write` dari adapter yang cocok dan verifikasi iterasi berjalan normal

## 2. Implementasi Adapter Spesifik

- [x] 2.1 Buat dan daftarkan `NativeSelectAdapter` yang menangani form berjenis `<select>` (termasuk multiple select) dan verifikasi dapat membaca/mengisi teks label elemen `<option>` dengan benar
- [x] 2.2 Buat dan daftarkan `GenericAriaComboboxAdapter` yang menargetkan `[role="combobox"]` menggunakan simulasi interaksi pointerdown/click, pencarian listbox global, dan `MutationObserver` (timeout 5s) lalu verifikasi sukses memilih opsi
- [x] 2.3 Buat dan daftarkan `QuasarSelectAdapter` yang difokuskan pada class spesifik `.q-select` yang bisa membaca chip (multiple), label text yang nampak, serta menangani input pencarian text (`use-input`) lalu verifikasi berjalan pada test UI Quasar

## 3. Penanganan Pengisian Secara Dependen & Asinkron

- [x] 3.1 Refactor iterasi field di content script agar menunggu field yang masih `disabled` berubah menjadi aktif lewat `MutationObserver` (maksimal 5 detik), lalu verifikasi field kota terisi setelah provinsi terisi otomatis
- [x] 3.2 Pastikan event blur/click-away dilontarkan ke elemen setelah adapter berhasil memilih agar menu dropdown otomatis tertutup dan verifikasi menu dropdown tidak nyangkut (terbuka) di layar

## 4. UI dan Pelaporan Error

- [x] 4.1 Modifikasi loop pengisian untuk mencatat setiap field beserta alasannya (misal: "Opsi tidak ditemukan") tanpa me-throw error yang mematikan keseluruhan loop, dan verifikasi field selanjutnya tetap terisi
- [x] 4.2 Ubah komponen Toast untuk menampilkan pesan gagal secara rinci ("x field berhasil, field A gagal karena...") dan verifikasi pop-up muncul di pojok dengan teks yang sesuai
