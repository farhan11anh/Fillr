# Proposal

## Why

Developer sering kali perlu mengetes form yang sama berulang kali dengan kombinasi data spesifik yang tidak bisa dihasilkan oleh generator dummy acak. Memungkinkan user menyimpan nilai form per URL lalu mengisinya kembali dengan satu klik sangat menghemat waktu testing untuk alur yang kompleks (misalnya SPA atau multistep form dengan dependency antar field).

## What Changes

- Menambahkan fitur deteksi URL tab aktif (origin + pathname, men-support SPA navigation tanpa reload).
- Menambahkan tombol "Simpan form" di popup untuk mencatat nilai semua field saat itu ke dalam `chrome.storage.local` berdasarkan URL.
- Menambahkan tombol "Isi dari tersimpan" untuk mengisi kembali form menggunakan data yang tersimpan sebelumnya (dengan memprioritaskan id, name, testid, label, urutan).
- Memodifikasi mekanisme pengisian agar field diproses secara sekuensial; menunggu field yang disabled/hidden atau options async lewat `MutationObserver` sebelum diisi.
- Menambahkan indikator visual: Badge toolbar bila URL memiliki data tersimpan, status di popup, serta penanda halus (Shadow DOM/outline) pada field yang diisi.
- Menambahkan editor list field di popup untuk melakukan edit nilai atau menghapus field yang tersimpan secara manual.
- Mengabaikan field tipe `password` dari mekanisme penyimpanan secara default.

## Capabilities

### New Capabilities
- (None - all additions will be within the existing form-autofill capability to centralize autofill features as requested).

### Modified Capabilities
- `extension-core/form-autofill`: 
  - Penambahan requirement "Menyimpan State Form Berdasarkan URL"
  - Penambahan requirement "Pengisian Form Tersimpan Secara Sekuensial & Asinkron"
  - Penambahan requirement "Indikator Visual Data Tersimpan"
  - Penambahan requirement "Manajemen Data Form Tersimpan (Edit/Hapus)"
  - Modifikasi requirement terkait "Eksekusi Autofill" untuk memperjelas batas antara dummy fill dan saved fill.

## Impact

- Membutuhkan penambahan logic background script (`chrome.tabs.onUpdated` / `chrome.webNavigation`) untuk mengupdate badge secara reaktif terhadap SPA routing.
- Mengubah alur injeksi script autofill dari sinkron menjadi asinkron (Promise/MutationObserver) guna melayani dependent fields.
- Storage capacity chrome extension akan terpakai untuk menampung serialized form values per origin+pathname.
