# Tasks

## 1. Pembersihan Fitur Dummy

- [x] 1.1 Hapus tombol dan UI pengisian dummy (termasuk setting locale, profile) dari `modes/autofill/AutofillMode.vue` dan pastikan ekstensi dapat di-build dengan normal
- [x] 1.2 Hapus file generator, mock, dan script lain yang berkaitan khusus dengan dummy fiktif (seperti di `utils/` atau direktori lain) lalu verifikasi lewat `grep` bahwa tidak ada referensi kode dummy yang tersisa

## 2. Pembangunan Reproduksi Playground

- [x] 2.1 Buat halaman uji UI Quasar di `playground/src/App.vue` berisi form `<select>` native, `q-select` biasa, `q-select` multiple, `q-select` dengan `use-input` (filter), dan field dependen (provinsi -> kota)
- [x] 2.2 Jalankan playground, isi manual, "Simpan form", lalu reload dan verifikasi bahwa "Isi form" gagal dengan mekanisme lama (untuk membuktikan akar masalah pada `design.md` valid)

## 3. Peningkatan Format Data dan Form Extraction

- [x] 3.1 Perbarui logika ekstraksi di `entrypoints/extractForm.content.ts` (melalui modifikasi adapter `read` atau `utils/savedForm.ts`) agar setiap field menyimpan `kind`, `value`, dan `label` (jika berbeda dari value)
- [x] 3.2 Verifikasi di Storage inspector bahwa data hasil "Simpan form" pada halaman playground kini mencatat struktur field yang baru dengan lengkap

## 4. Perbaikan Logika Pengisian Dropdown

- [x] 4.1 Modifikasi strategi penulisan adapter di `utils/fieldAdapters.ts` untuk dropdown native agar mencoba fallback mencocokkan `value` native sebelum teks `label` (untuk kompatibilitas)
- [x] 4.2 Tambahkan logika pada adapter `q-select` dan aria combobox agar mensimulasikan *click* untuk merender elemen opsi yang di-teleport, lalu mencocokkan opsi berdasarkan string secara eksak atau `includes`
- [x] 4.3 Terapkan timeout dan observer yang tepat untuk menunggu menu dropdown terbuka (termasuk kasus asinkron), dan pastikan menu ditutup kembali setelah opsi terisi
- [x] 4.4 Verifikasi dengan menekan "Isi form" pada playground bahwa seluruh kasus dropdown kompleks berhasil terisi ulang

## 5. Pelaporan Kegagalan Terperinci

- [x] 5.1 Refactor alur pengisian pada `entrypoints/fillSavedForm.content.ts` agar tiap kegagalan field di-catch, dicatat (console warn dengan nama dan alasan error), tanpa menghentikan sisa form
- [x] 5.2 Ubah tampilan popup/toast agar mengakumulasi status ("x field berhasil, field A gagal karena opsi tidak ditemukan") dan verifikasi toast dirender dengan pesan informatif pada kondisi error simulasi
