# Proposal

## Why

Identifikasi field saat proses "Simpan form" sering kali menggunakan nama atau atribut yang tidak stabil, terutama pada UI framework modern seperti Quasar atau React. Misalnya, nilai yang terpilih atau ikon dapat tergabung ke dalam nama field, dan ID auto-generated yang dibuat framework berubah pada setiap kali *render* atau *reload*. Hal ini mengakibatkan field gagal ditemukan pada saat proses pengisian ulang ("Isi form").

## What Changes

- Mengekstrak teks label dari field secara lebih teliti dengan membuang teks kotor (seperti teks ikon ligatur atau nilai yang terpilih).
- Mengabaikan ID yang diklasifikasikan sebagai *auto-generated* (seperti `f_<uuid>`, `:r:`, `v-`, `headlessui-`).
- Menyimpan himpunan pengenal atau jalur (path) konteks dari sebuah field yang stabil agar bisa dilakukan percobaan fallback jika pencarian utama gagal.
- Memperbaiki pesan kegagalan agar tidak membingungkan pengguna dengan menampilkan pengenal field yang lebih ramah manusia (human-readable) tanpa menyertakan pengenal framework.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `extension-core/form-autofill`: Requirement "Deteksi Field Form" (akan dimodifikasi untuk memastikan kestabilan identifier) dan Requirement "Eksekusi Autofill" (strategi pencarian dengan data identifier jamak serta format laporan error).

## Impact

- `utils/savedForm.ts` & `entrypoints/extractForm.content.ts`: Modifikasi pencarian label dan nama, deteksi id acak.
- `entrypoints/fillSavedForm.content.ts`: Strategi pemakaian beberapa identifier saat mencari target elemen, dan penyesuaian error logging UI.
- `playground/src/App.vue` & `playground/test`: Penambahan komponen untuk simulasi.
