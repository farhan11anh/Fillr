# Proposal

## Why

Fitur simpan dan isi form per URL pada ekstensi Fillkit saat ini tidak mendukung field berjenis dropdown, terutama dropdown kustom dari library UI yang merender opsi di luar form (teleport ke body). Hal ini menyebabkan nilai dropdown tidak tersimpan dan tidak terisi kembali. Ekstensi perlu mendukung pengisian dropdown native maupun kustom agar fungsionalitas autofill dapat berjalan maksimal di berbagai framework.

## What Changes

- Menambahkan arsitektur adapter field dengan pola {detect, read, write} untuk mendukung berbagai jenis dropdown (native `<select>`, Quasar `q-select`, dan ARIA generic combobox).
- Menyimpan nilai dropdown berdasarkan teks opsi yang terpilih (label yang terlihat user).
- Menambahkan logika pengisian dropdown kustom yang meniru perilaku pointer/mouse (pointerdown, click) dan menunggu kemunculan opsi lewat `MutationObserver`.
- Menangani dropdown yang bergantung pada dropdown lain (misal: provinsi lalu kota) dengan memanfaatkan antrean field disabled.
- Memperbarui daftar field tersimpan di UI popup untuk dapat menampilkan dan mengedit opsi teks dropdown secara langsung.

## Capabilities

### New Capabilities
<!-- No new capabilities. -->

### Modified Capabilities
- `extension-core/form-autofill`: Menambahkan dukungan ekstraksi dan pengisian nilai untuk elemen dropdown (native, quasar, generic ARIA), serta memperbarui logika antrean pengisian (dependency waiting) dan pelaporan error per field saat pengisian gagal.

## Impact

- `entrypoints/fillSavedForm.content.ts`: Modifikasi algoritma iterasi field dan pengisian agar menggunakan arsitektur adapter dan event dispatch kustom.
- `utils/savedForm.ts`: Menyesuaikan logika ekstraksi agar mendeteksi dan mengambil teks dari field dropdown/combobox.
- `modes/autofill/AutofillMode.vue`: Pembaruan penanganan pesan error/gagal terisi agar tidak menghentikan keseluruhan autofill dan menampilkan status per field.
