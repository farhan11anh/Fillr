# Design

## Context

Ekstensi Fillkit saat ini menangani input form dasar dengan mengekstrak `.value` dan mengisi ulang nilai tersebut. Namun, dropdown custom pada framework UI modern (seperti Quasar, Vuetify, dll) sering kali merender listbox dan opsinya di luar form element (teleport ke `<body>`), dan komponen field-nya tidak memiliki nilai yang mudah dibaca atau ditulis lewat `.value`. See `proposal.md` for full motivation.

## Goals / Non-Goals

**Goals:**
- Mengimplementasikan pola arsitektur Adapter untuk memisahkan logika perlakuan terhadap setiap jenis dropdown.
- Mendukung dropdown native (`<select>`), Quasar (`q-select`), dan fallback generik berbasis ARIA.
- Mendeteksi dan menunggu dropdown dependen hingga opsi ter-load menggunakan teknik antrean.

**Non-Goals:**
- Mendukung dropdown di dalam `iframe` atau tertutup dalam Shadow DOM.
- Menyimpan dan memetakan *seluruh* daftar opsi dropdown ke popup ekstensi (hanya teks opsi yang terpilih saat itu yang disimpan).
- Menambah adapter spesifik untuk library selain Quasar (kecuali fallback ARIA gagal).

## Decisions

**1. Arsitektur Adapter Form Field**
- **Decision**: Menggunakan pola interface adapter `{ detect(el), read(el), write(el, value) }`.
- **Rationale**: Memungkinkan sistem menambahkan dukungan library UI baru secara terisolasi tanpa merusak logika utama `fillSavedForm`. Urutan prioritas eksekusi adalah: Adapter Spesifik (Quasar) > Adapter Generik ARIA > Adapter Native Select > Text Input standar.
- **Alternatives**: Menyisipkan percabangan `if-else` atau `switch` panjang di fungsi utama. Ini ditolak karena kode akan cepat menjadi sulit di-maintain (spaghetti code) ketika jumlah library yang didukung bertambah.

**2. Mekanisme Pengisian Dropdown Kustom**
- **Decision**: Menyimulasikan urutan event pointer/mouse (pointerdown, mousedown, mouseup, click) untuk membuka menu, mengandalkan `MutationObserver` untuk mendeteksi kemunculan menu di `document.body`, dan kembali menggunakan event mouse untuk memilih opsi (dengan mencocokkan teks `exact` atau `includes`), kemudian memastikan menu ditutup.
- **Rationale**: Merupakan cara paling reliable untuk memanipulasi komponen yang dibangun di atas Vue/React, karena kerangka kerja tersebut sangat bergantung pada DOM event.
- **Alternatives**: Memanggil method internal komponen via Vue/React devtools hooks. Ditolak karena terlalu rapuh (API internal sering berubah) dan tidak bekerja di mode production.

**3. Adapter ARIA sebagai Fallback**
- **Decision**: Membuat adapter generik yang mendeteksi elemen dengan `role="combobox"` dan `aria-haspopup="listbox"`.
- **Rationale**: Sebagian besar library UI (MUI, Ant Design, Element Plus) mengikuti standar aksesibilitas W3C. Jika fallback ini terbukti gagal saat implementasi untuk suatu library tertentu, maka library tersebut harus dicatat di sini dan dibuatkan adapternya sendiri. Saat ini, belum ada library tambahan yang ditargetkan di luar Quasar.

**4. Penanganan Dropdown Dependen**
- **Decision**: Logika pengisian field dilakukan secara berurutan (sequential) menggunakan `await`. Jika suatu field dinilai `disabled`, maka fungsi iterasi akan menggunakan `MutationObserver` dengan batas waktu (timeout misal 5 detik) menunggu hingga atribut `disabled` dihilangkan atau daftar opsinya termuat.
- **Rationale**: Memecahkan masalah form cascading (seperti Provinsi -> Kota) dengan pendekatan paling elegan tanpa mem-hardcode delay.

## Risks / Trade-offs

- **[Risk]** Interaksi kustom pada menu dropdown (seperti transisi animasi yang terlalu lama) menyebabkan klik target dieksekusi sebelum elemen benar-benar *clickable*.
  - **Mitigation**: Gunakan `requestAnimationFrame` atau delay singkat `setTimeout` sesaat setelah `MutationObserver` terpicu sebelum melepaskan event click.
- **[Risk]** UI library yang merender listbox dengan `Virtual Scroll` (hanya merender item yang terlihat) membuat teks opsi yang dituju tidak ada di DOM.
  - **Mitigation**: Memanfaatkan input text field (jika ada, seperti `q-select` dengan `use-input`) untuk mengetikkan nama item dan mem-filter hasil rendering sebelum mencari opsinya.

## Open Questions

- Apakah *delay* standar 5 detik cukup untuk menunggu API fetch opsi dropdown async (seperti pada q-select async options)? Jika form sangat lambat, haruskah timeout tersebut dapat dikonfigurasi per-profile?
