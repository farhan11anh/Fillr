# Tasks

## 1. Setup Data Generator & Storage

- [x] 1.1 Buat modul `utils/faker.ts` yang berisi fungsi-fungsi generator data dummy fiktif (email, NIK, nomor telepon, nama) dengan dukungan format Indonesia dan English. Verifikasi dengan memanggil fungsi tersebut di console dan memastikan tipe outputnya benar.
- [x] 1.2 Implementasikan state/composable `composables/useAutofillProfile.ts` untuk memanajemen profil konfigurasi (termasuk opsi *overwrite* field) dan menyimpannya di `chrome.storage.local`. Verifikasi script berhasil menulis config ke storage tanpa error.

## 2. Logika Content Script & Heuristik Form

- [x] 2.1 Buat fungsi utama eksekutor `utils/fillForm.ts` yang akan mencari elemen `<input>`, `<textarea>`, `<select>` dan melakukan pencocokan heuristik (berdasarkan `type`, `name`, `id`, `placeholder`, `autocomplete`). Verifikasi skrip dapat mengenali tipe field email, telepon, teks biasa, dll.
- [x] 2.2 Tambahkan logika untuk _bypass setter_ DOM (`HTMLInputElement.prototype.value`) dan men-_dispatch_ event native (`input`, `change`, `blur`) saat nilai dimodifikasi. Verifikasi elemen form framework reaktif menangkap perubahan ini.
- [x] 2.3 Integrasikan fungsi pencegahan penimpaan nilai (overwrite prevention) yang mengecek kondisi _value_ elemen dan boolean *overwrite* sebelum mengisinya. Verifikasi form yang telah terisi sebelumnya tidak berubah tanpa persetujuan.

## 3. Integrasi Eksekusi UI dan Shortcut Keyboard

- [x] 3.1 Update file konfigurasi `wxt.config.ts` untuk meregistrasi pemicu shortcut keyboard (commands) pada manifest ekstensi. Verifikasi hasil build `manifest.json` mengandung deklarasi commands.
- [x] 3.2 Implementasikan background script di `entrypoints/background.ts` untuk memantau shortcut keyboard dan menjalankan `chrome.scripting.executeScript(fillForm.ts)` pada tab aktif (activeTab). Verifikasi shortcut bekerja dan data form terisi.
- [x] 3.3 Lengkapi UI pada komponen `AutofillMode.vue` dengan opsi pilihan profil, toggle *overwrite*, dan tombol pemicu utama "Fill Form" yang terhubung ke `executeScript`. Verifikasi klik tombol berhasil memicu pengisian di halaman form uji.
