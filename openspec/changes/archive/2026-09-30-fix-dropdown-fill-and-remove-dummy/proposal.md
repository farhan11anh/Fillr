# Proposal

## Why

Mode autofill pada ekstensi Fillkit saat ini memiliki dua fungsi terpisah: mengisi dengan data dummy fiktif (yang sudah tidak lagi digunakan/dibutuhkan) dan mengisi form dari data tersimpan (yang masih gagal mengisi dropdown dengan benar). Penghapusan fitur pengisian dummy diperlukan untuk menyederhanakan kode dan merapikan UI popup, sementara perbaikan pada pengisian dropdown (yang membutuhkan diagnosis mendalam karena hanya label teks yang tersimpan sebelumnya) sangat krusial agar fitur utama ini berjalan lancar di berbagai skenario, seperti native select, custom dropdown (Quasar), dan dropdown asinkron.

## What Changes

- **BREAKING**: Menghapus fitur pengisian dengan data dummy beserta profil dummy, setting locale, UI button, dan seluruh test serta style yang berelasi dengannya. UI ekstensi difokuskan murni pada "Simpan form" dan "Isi form".
- Menambahkan test page khusus (playground menggunakan Vite + Vue 3 + Quasar) untuk verifikasi pengisian dropdown yang kompleks, termasuk `q-select` filter, async, dan dropdown berurutan (provinsi -> kota).
- Memodifikasi format data form yang tersimpan di storage: `value` (untuk input/native) dan tambahan info internal jika diperlukan, dengan tetap mempertahankan backward-compatibility untuk format data lama.
- Mendiagnosis dan memperbaiki masalah dropdown yang gagal terisi dengan melacak masalah menggunakan fallback pencarian label di seluruh dokumen dan melaporkan log error secara spesifik saat pengisian (success dan warning log per field).

## Capabilities

### New Capabilities

- Tidak ada kapabilitas baru, fitur merupakan perbaikan dari yang sudah ada dan penyederhanaan UI.

### Modified Capabilities

- `extension-core/form-autofill`: Mengubah Requirement Deteksi dan Ekstraksi Nilai Dropdown serta Pengisian Dropdown dengan menambah kriteria keberhasilan pengujian (lewat playground) dan menghapus Requirement Generate Data Dummy Fiktif sepenuhnya (REMOVED).

## Impact

- `modes/autofill/AutofillMode.vue`: Dihapusnya tombol dan logic pengisian dummy.
- `utils/savedForm.ts`: Perubahan struktur data untuk mengakomodasi backward compatibility label-only vs format data baru.
- `entrypoints/fillSavedForm.content.ts`: Perbaikan mekanisme pencocokan dan pengisian dropdown kustom serta penambahan console log diagnostic.
- `tests/` atau file terkait generator dummy akan dihapus.
- Tidak boleh merusak data `chrome.storage.local` milik pengguna.
