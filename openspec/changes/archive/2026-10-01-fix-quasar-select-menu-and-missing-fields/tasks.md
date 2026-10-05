# Tasks

## 1. Peningkatan Utilitas contextLabel

- [x] 1.1 Modifikasi fungsi utilitas `extractContextLabel` (di `utils/fieldUtils.ts`) untuk menaiki hirarki *parent element* maksimal hingga 4 tingkat. Di setiap tingkatan, iterasi ke *previous sibling* untuk mencari elemen dengan teks representatif (misal: panjang <= 80 karakter dan tidak membungkus tag input lain). Verifikasi melalui *unit test* spesifik pada DOM maya JSDOM.

## 2. Perbaikan Visibilitas & Pelacakan Menu Quasar (QuasarSelectAdapter)

- [x] 2.1 Ganti semua pemeriksaan visibilitas `.q-menu` (sebelumnya `offsetParent !== null`) menjadi evaluasi fungsi kombinasi: `getComputedStyle(el).display !== 'none'`, `visibility !== 'hidden'`, dan `getClientRects().length > 0` di dalam file `utils/fieldAdapters.ts`. Verifikasi di lingkungan lokal atau Playground bahwa fungsi identifikasi tidak menemui jalan buntu (timeout) saat mendeteksi komponen dropdown *fixed*.
- [x] 2.2 Terapkan mekanisme pelacakan target menu spesifik menggunakan atribut `aria-controls` dari input *filter* turunan `.q-select` (jika menggunakan `use-input`), yang digabungkan bersama fallback pencarian elemen `.q-menu` aktif. Verifikasi bahwa target dropdown yang terpilih benar-benar dropdown milik form tersebut meski ada beberapa `.q-select` di satu halaman.

## 3. Eksekusi Native Event & Smart Wait (Async Dropdown)

- [x] 3.1 Tulis simulasi event native secara sekuensial komplit (`pointerdown`, `mousedown`, `mouseup`, dan `click`) pada kontainer fungsional input (`.q-field__control` atau turunannya yang valid) demi memicu dropdown terbuka, dan *trigger* pengetikan filter melalui value setter. Verifikasi secara lokal/Playground bahwa popup menu terentang tanpa kegagalan trigger event dari framework.
- [x] 3.2 Terapkan pola penantian cerdas (*smart polling/waiting*) setelah klik interaktif: Tunggu hingga indikator `.q-spinner` tidak lagi ditemukan dan opsi ter-render bukanlah "Tidak ada data" (maks. timeout 10 detik). Apabila *query* input awal gagal membuahkan list item setelah proses menunggu, sisipkan logika *fallback*: kosongkan input filter ulang dan cari kembali item tanpa *filter*. Verifikasi di console log tak ada error prematur.
- [x] 3.3 Terapkan metode seleksi opsi dua putaran: Prioritaskan validasi *exact match* (setelah proses normalisasi *case* & spasi), diikuti validasi *partial match* (`includes`) jika diperlukan. Tutup proses pengisian satu field dengan melakukan verifikasi *read value* pasca pengisian (*Post-Fill Verification*). Jika nilai tak serasi, rekam / kembalikan Exception untuk diolah. Verifikasi bahwa UI Autofill memperlihatkan toast kegagalan terperinci namun tak memblokir field lainnya.
