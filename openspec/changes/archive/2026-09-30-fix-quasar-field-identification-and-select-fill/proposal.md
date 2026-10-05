# Proposal

## Why

Pada halaman Quasar yang kompleks, fungsi "Isi form" saat ini mengalami kegagalan secara menyeluruh, di mana field seperti `q-select` dan `q-input` selalu gagal ditemukan (`Element not found on page`). Hal ini disebabkan oleh cara pengumpulan teks label dari root `.q-field` yang bercampur dengan teks nilai yang terpilih beserta teks ikon seperti "arrow_drop_down". Di samping itu, ada `q-input` yang tidak memiliki label langsung tetapi hanya diidentifikasi oleh id acak (`f_<uuid>`) yang berubah di tiap *render*, dan adapter Quasar kesulitan mendeteksi kemunculan menu `.q-menu` akibat properti *fixed positioning* (yang membuat `offsetParent` menjadi null). Kegagalan ini membutuhkan penyempurnaan pada unit pencocokan field agar berfokus pada root field (`.q-field`), membersihkan nilai label, serta meningkatkan skor-base resolver dan fiksasi pada adapter Quasar.

## What Changes

- Menstandarisasi objek pencarian field (field root) menjadi elemen terluar kontrol (misal: `.q-field` pada Quasar).
- Mengekstrak teks label dengan urutan fallback yang benar (mulai dari `.q-field__label` hingga teks konteks pendahulu) sembari membuang nilai terpilih dan teks ikon.
- Menyimpan himpunan fingerprint lengkap (`kind`, `label`, `contextLabel`, `name`, `dataTestId`, `ariaLabel`, `placeholder`, `stableId`, `ordinal`).
- Memperkenalkan resolver berbasis skor untuk mengakumulasi kecocokan beberapa pengenal, serta memilih kandidat terbaik tanpa menebak dalam kondisi ambigu.
- Memperbaiki adapter Quasar agar mendeteksi kemunculan menu melalui `isVisible` dan `MutationObserver`, menyeleksi menu yang tepat (menggunakan `aria-controls`), dan mengisi `q-select` `use-input` secara dinamis dengan urutan event native (pointerdown, mousedown, mouseup, click).
- Menambahkan verifikasi pasca-pengisian dengan membaca nilai kembalian.
- Menyediakan log diagnostik yang informatif (menampilkan alasan kegagalan dan detail skor tanpa UI id yang sulit dibaca).

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `extension-core/form-autofill`: Requirement "Deteksi Field Form" (akan dimodifikasi untuk memperkenalkan field root, ekstraksi label dengan fallback posisi/konteks, dan perhitungan ordinal) dan Requirement "Eksekusi Autofill" (dimodifikasi untuk menambahkan skoring resolver, mekanisme interaksi `use-input` Quasar yang presisi, serta verifikasi pasca-pengisian).

## Impact

- `utils/savedForm.ts` & `entrypoints/extractForm.content.ts`: Perubahan besar pada fungsi ekstraksi label (contextual label), ordinal index dalam container, dan struktur fingerprint yang disimpan.
- `utils/fieldAdapters.ts`: Modifikasi `QuasarSelectAdapter` (penggunaan `isVisible`, urutan event klik native, `aria-controls`, `MutationObserver`).
- `entrypoints/fillSavedForm.content.ts`: Transformasi fungsi `waitForElement`/`getElement` menjadi sistem resolver berskor (`scoreResolver`), dan penambahan verifikasi pasca-pengisian.
- `playground/src/App.vue`: Penambahan *edge cases* simulasi form Quasar yang kompleks (q-select dengan `use-input`, q-input tanpa label, dsb.).
