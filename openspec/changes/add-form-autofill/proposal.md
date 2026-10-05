# Proposal

## Why

Mode "Autofill" merupakan salah satu fitur inti dari ekstensi ini untuk mempermudah alur kerja developer frontend. Mengisi form pendaftaran atau inputan secara manual berulang kali saat proses testing sangat memakan waktu. Dibutuhkan fitur autofill pintar yang mendeteksi field form secara heuristik dan mengisinya dengan data dummy (contoh: email valid, NIK fiktif, telepon acak) secara otomatis, yang mendukung sinkronisasi state untuk framework SPA modern.

## What Changes

- Menambahkan *content script* untuk mendeteksi elemen `input`, `select`, dan `textarea` pada halaman aktif.
- Menerapkan heuristik pencocokan field berdasarkan atribut DOM (`type`, `name`, `id`, `placeholder`, `label`, `autocomplete`).
- Menyediakan generator data dummy dengan dukungan locale Indonesia dan English (menghasilkan data yang jelas palsu/tidak valid untuk testing).
- Memicu pengisian form melalui tombol "Fill" di UI popup ekstensi dan *shortcut keyboard*.
- Memancarkan event `input`, `change`, dan `blur` pada elemen DOM agar reaktivitas data pada framework modern (seperti `v-model` pada Vue atau _controlled component_ React) ikut ter-update.
- Field email akan dipastikan diisi format valid, sementara field tanpa pola dikenali dibiarkan kosong.
- Mencegah penimpaan (overwrite) pada field yang sudah memiliki nilai, kecuali ada opsi overwrite yang diaktifkan.
- Menggunakan `chrome.storage.local` untuk menyimpan beberapa "profile" data dummy (tanpa integrasi sinkronisasi cloud).

## Capabilities

### New Capabilities
- `extension-core/form-autofill`: Logika deteksi form, heuristik pencocokan field, generate data dummy fiktif (termasuk email valid dan format Indonesia/Inggris), trigger sinkronisasi event framework, dan penanganan status field yang sudah terisi.

### Modified Capabilities
- (None)

## Impact

- Penambahan *content script* yang disuntikkan ke dalam tab aktif saat triggered (butuh `activeTab` dan `scripting` permission yang sudah diinisiasi sebelumnya).
- Pembaruan UI popup pada `AutofillMode.vue` untuk memicu aksi autofill.
- Penyimpanan profil ke dalam `chrome.storage.local`.
- Penambahan deklarasi command pada `manifest.json` untuk dukungan shortcut keyboard.
