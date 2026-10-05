# Design

## Context

Fitur pengisian dummy fiktif yang lama menyebabkan kode menjadi rumit dan usang, sedangkan fitur pengisian form dari data yang telah tersimpan mengalami masalah pada elemen dropdown (khususnya library UI seperti `q-select` dan aria combobox). Ekstensi telah memisahkan alur pengisian dari penyimpanan, namun dropdown tidak terisi karena keterbatasan strategi pencocokan opsi dan format penyimpanan lama.

## Goals / Non-Goals

**Goals:**
- Menghilangkan sepenuhnya kode dummy generator beserta UI dan dependensinya.
- Menyediakan lingkungan `playground/` terisolasi untuk mereproduksi masalah dropdown.
- Menemukan dan mendokumentasikan akar masalah pengisian dropdown secara objektif.
- Memperbaiki pengisian dropdown kustom dengan strategi pencocokan fallback.
- Memastikan struktur baru (value, label, kind) tidak memecahkan backward compatibility format penyimpanan string yang lama.
- Mencatat alasan kegagalan setiap field untuk di-display dalam satu UI Toast.

**Non-Goals:**
- Dukungan dropdown asinkron yang membutuhkan navigasi jaringan tanpa API khusus.
- Eksekusi pengisian di dalam Shadow DOM yang tertutup atau iFrame cross-origin.

## Akar Masalah

Berdasarkan reproduksi di `playground/`:
- **Native Select**: Field `<select>` yang tersimpan di format lama biasanya mencatat `label` opsi (karena diambil dari `.value` atau innerText yang kebetulan sama), namun saat mengisi, elemen aslinya memerlukan `value` attribute dari `<option>`. Jika option tag memiliki attribute value="ID-123" tapi teksnya "Indonesia", maka ekstensi yang menyimpan "Indonesia" akan gagal mengisinya kembali lewat setter standar yang mengharapkan "ID-123".
- **Quasar Select**: Quasar meng-render opsi dropdown terpisah di bagian paling bawah DOM (`<body>`) dalam elemen `q-menu`. Autofill saat ini tidak membuka menu sebelum mencoba mengisi, sehingga elemen opsi tidak eksis di DOM pada saat dicari. Selain itu, value v-model Quasar tidak dapat diubah hanya dengan memanipulasi DOM input tanpa interaksi click native.

## Decisions

- **Menghapus Dummy UI & Engine**: Script generator (misal `dummyGenerator.ts` atau locale generator) dihapus sepenuhnya, UI `AutofillMode.vue` akan dipersingkat hanya untuk tombol "Simpan form" dan "Isi form".
- **Format Penyimpanan yang Diperluas**: Menyimpan objek fallback berisi `kind`, `value`, dan `label` pada setiap entri, tapi tetap membaca data `string` lama dan mencoba mencocokkannya ke label atau value jika formatnya string.
- **Buka & Cari (Open & Search) untuk Kustom Dropdown**: Adaptor dropdown akan mensimulasikan event mousedown/click untuk merender listbox, lalu menunggu dengan MutationObserver sebelum melakukan iterasi dan text-matching untuk opsi yang tepat.

## Risks / Trade-offs

- [Risk] Peningkatan kompleksitas performa karena harus memicu render DOM (membuka menu) untuk dropdown -> Diatasi dengan limit timeout 5 detik pada observer, serta membiarkan error dicatat dalam list field gagal tanpa melempar exception keras.
- [Risk] Data format lama tidak terisi optimal pada kasus tertentu -> Ekstensi akan melakukan pencocokan ganda (uji `value` dulu, lalu `label`) terhadap string tersebut.
