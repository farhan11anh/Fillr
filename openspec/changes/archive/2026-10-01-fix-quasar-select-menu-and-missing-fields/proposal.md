# Proposal

## Why

Autofill untuk form yang dibangun dengan framework modern (seperti Quasar) sering mengalami kegagalan pada elemen kompleks seperti `q-select` dan input dengan masking khusus. `.q-menu` pada Quasar dirender dengan `position: fixed`, yang membuat pemeriksaan visibilitas default (melalui `offsetParent`) selalu gagal dan memicu timeout. Selain itu, input tanpa elemen `<label>` formal atau ID yang stabil, yang hanya diberi label melalui teks dalam grid/layout terpisah (seperti `<b>` di dalam `.row` sebelahnya), gagal terdeteksi dan tidak tersimpan. Perbaikan ini diperlukan agar ekstensi Fillkit mampu menyimpan dan mengisi tipe-tipe kontrol ini secara handal di ekosistem UI yang sebenarnya.

## What Changes

- [MODIFIED] Mekanisme identifikasi menu dropdown asinkron (khususnya `q-select`): 
  - Verifikasi visibilitas tidak lagi menggunakan `offsetParent`, melainkan kombinasi `getComputedStyle` dan `getClientRects`.
  - Pendeteksian elemen menu spesifik menggunakan atribut `aria-controls` atau fallback perbandingan snapshot DOM saat interaksi klik pada `.q-field__control`.
- [MODIFIED] Alur interaksi pengisian dropdown `use-input` asinkron:
  - Menyertakan event interaksi lengkap (pointerdown, mousedown, mouseup, klik).
  - Melakukan delay pintar (smart wait) hingga indikator loading (`.q-spinner`) menghilang dan bukan menu "Tidak ada data".
  - Pencocokan opsi dua tahap: exact match (telah dinormalisasi dari spasi dan case) lalu partial match.
- [MODIFIED] Pencarian contextLabel (untuk field tanpa atribut penanda) diperluas:
  - Penjelajahan sibling dan ancestor ditingkatkan untuk dapat mencari teks pada elemen label kustom (seperti `<b>`) yang terpisah oleh div container tata letak kolom (misalnya di dalam `.row`).

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `extension-core/form-autofill`: Peningkatan kompatibilitas form asinkron/kompleks, meliputi modifikasi pada requirement Deteksi Field Form (pencarian contextLabel ekstensif pada layout terpisah) dan Eksekusi Autofill (alur asinkron dengan validasi loading, event native lengkap, pencocokan prioritas opsi dropdown).

## Impact

- Modul utilitas: `fieldUtils.ts` (khususnya `extractContextLabel`) dan `fieldAdapters.ts` (`QuasarSelectAdapter`).
- Ekstensi menjadi lebih adaptif pada berbagai bentuk form dari framework frontend seperti Quasar dan Vue tanpa merusak kompatibilitas standar HTML5 form.
