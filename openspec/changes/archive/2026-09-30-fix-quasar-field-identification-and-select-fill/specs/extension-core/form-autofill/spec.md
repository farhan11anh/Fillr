# Delta Spec: Form Autofill

## Modified Requirement: Deteksi Field Form
- [MODIFIED] Scope "satuan field" diperluas menjadi "field root": untuk framework UI (seperti Quasar), elemen terluar dari kontrol (`.q-field`) adalah representasi 1 field. Elemen di dalamnya harus dinormalisasi ke root-nya sebelum diproses.
- [MODIFIED] Proses ekstraksi label (untuk fingerprint form):
  1. Ambil `.q-field__label` (label spesifik Quasar).
  2. Ambil atribut `aria-label` atau `aria-labelledby`.
  3. Ambil elemen `<label>` yang merujuk pada kontrol, asalkan bukan elemen wrapper root itu sendiri.
  4. [ADDED] `contextLabel`: Cari elemen teks terdekat sebelumnya yang panjangnya ≤ 80 karakter dan tidak membungkus input apa pun (melalui *sibling* dan pencarian hingga 4 *ancestor* ke atas).
  5. Ambil `placeholder`.
- [ADDED] Teks label yang diambil harus dibersihkan dari nilai terpilih (.q-field__native) dan elemen dekoratif/ikon (.q-icon, .material-icons, dsb) melalui kloning sementara saat mengekstrak textContent.
- [MODIFIED] Format fingerprint data penyimpanan setiap field ditambahkan dengan `contextLabel`, `stableId` (ID yang bukan hasil auto-generate seperti `f_<uuid>` atau `v-`), dan `ordinal` (nomor urut antar elemen sejenis di dalam *container* yang sama).

## Modified Requirement: Eksekusi Autofill
- [MODIFIED] Strategi pencarian elemen tidak lagi bersifat perulangan biasa dengan *first-match* fallback yang longgar, melainkan menerapkan sistem resolver berbasis **skor (scoring system)**.
  - Setiap properti pengenal (`testId`, `name`, `label`, `contextLabel`, dsb.) menyumbang skor bobot tertentu jika nilainya cocok dengan kandidat elemen di halaman.
  - Jika ada lebih dari satu elemen berskor tertinggi yang sama, elemen disortir dengan `ordinal` (posisi urutan elemen dalam halaman). Jika setelah diperhitungkan `ordinal` masih lebih dari 1 kandidat yang sama skornya, catat sebagai kegagalan dengan alasan "ambigu".
- [MODIFIED] Interaksi pada `q-select` Quasar melalui adapter diwajibkan:
  - Mengubah pemeriksaan `.q-menu` yang terlihat (`visible`) menggunakan kalkulasi `getComputedStyle` atau `getClientRects()`, bukan `offsetParent` yang bernilai `null` karena styling `position: fixed`.
  - Mencari menu `q-select` secara spesifik, salah satunya melalui nilai id di atribut `aria-controls` elemen input, alih-alih `document.querySelector('.q-menu')` acak.
  - Untuk `q-select` dengan fungsi `use-input` (pencarian teks internal), adapter wajib memicu alur event mouse asli (pointerdown, mousedown, mouseup, click) secara utuh, mengatur input teks, dan menunggu opsi hasil pencarian ter-*render* dalam DOM.
- [ADDED] Langkah verifikasi pasca-pengisian (Post-Fill Verification): adapter harus membaca kembali `value` yang tampil pada field root dan menilainya dengan data yang diharapkan. Hanya catat berhasil jika nilai sesuai.

## Data Persistensi
- Entri penyimpanan yang sudah berformat lama harus didukung secara *backward-compatible*, sehingga tidak membuat form *crash*. Bila field lama gagal ditemukan (misal karena teks labelnya dulu bercampur icon/nilai), field dilewati dan menampilkan log informasi tanpa merusak proses pengisian keseluruhan.
