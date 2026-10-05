# Architecture & Technical Design

## Akar Masalah
Dari proses investigasi awal terhadap kegagalan pengisian form di UI Quasar:
- **Pengambilan Label yang Kotor**: Kode `Simpan Form` sebelumnya menggunakan `.textContent` langsung dari tag `<label class="q-field">`. DOM tree Quasar pada root kontrol ini meliputi `.q-field__native` (tempat merender opsi yang sedang terpilih) serta `.q-icon` (ligature font seperti `arrow_drop_down`). Saat "Isi form", elemen baru yang belum terpilih memiliki label "Label arrow_drop_down", sedangkan elemen yang tersimpan bernilai "Label OptionName arrow_drop_down". Hal ini menghasilkan ketidakcocokan.
- **Minimnya Pengenal untuk Input Tanpa Label**: Sebuah form *grid/responsive* pada Quasar dapat merender kolom teks sebagai judul/label tersendiri di elemen `<b>` dalam struktur `.row > div.form-label-responsive`. Sedangkan `q-input`-nya berada di kolom `.row > div.form-control` tanpa `name` atau atribut label langsung, melainkan sekadar dibekali `id` dengan pattern acak (misal `f_e664db...`). Fallback identifier lawas tidak memprediksi pencarian label berdasarkan DOM posisi relatif.
- **Interaksi Quasar Select Adapter Error**: Adapter `.q-select` membuka menu secara asinkron lalu berusaha menemukan `.q-menu`. Kondisi sebelumnya mencari apakah `offsetParent !== null` untuk memastikan apakah `.q-menu` telah terender (visible). Namun framework mendesain `.q-menu` dengan posisi melayang (fixed rendering/teleport to body), sehingga `offsetParent` *native browser* akan mengembalikan `null` bahkan saat menu tersebut tampak di layar (visible) dan di-klik. Akibatnya adapter mengalami timeout (5 detik).
- **Pengambilan Menu Salah**: Adapter `.q-select` lawas mengambil kemunculan pertama elemen yang bernama class `.q-menu` secara pasrah (`document.querySelector('.q-menu')`). Bila halaman tersebut sudah memiliki q-menu lain yang ter-mount statis secara invisible, atau di *navigation drawer*, ia akan mengambil menu yang salah dan tidak dapat mem-parsing data options-nya.
- **Laporan Falsely Successful**: Sistem eksekusi memberikan pesan kembalian berhasil ("Filled x fields") asalkan tak ada error fatal yang tertangkap *catch block*, meskipun pada nyatanya proses pemilihan data pada dropdown gagal terjadi (nilai input tak berubah).

## Desain Solusi (Resolver Berbasis Skor)
Alih-alih urutan IF/ELSE pencarian elemen yang kaku, kita menerapkan *Weighted Scoring System*.

**Formula Fingerprint pada Storage**:
```json
{
  "kind": "quasar_select",
  "name": "hospital",
  "stableId": "hospital-field",
  "label": "Pilih Rumah Sakit",
  "contextLabel": "Rumah Sakit Asal",
  "placeholder": "Cari rumah sakit...",
  "ordinal": {
    "index": 1,
    "total": 3,
    "containerKey": ".form-card-container"
  },
  "value": "RS Dr. Sutomo"
}
```

**Proses Resolver**:
1. Kumpulkan seluruh **field root** dari halaman web (elemen `.q-field`, `input`, `select`, `textarea` yang valid dan tidak tersembunyi).
2. Lakukan iterasi setiap fingerprint tersimpan terhadap setiap candidate field root.
3. Tambahkan poin/skor kecocokan untuk kandidat:
   - Match `stableId`: +50 poin
   - Match `name`: +40 poin
   - Match `testId`: +40 poin
   - Match `label` bersih: +30 poin
   - Match `ariaLabel`: +30 poin
   - Match `placeholder`: +20 poin
   - Match `contextLabel`: +10 poin
4. Himpun seluruh kandidat yang skornya melampaui *threshold minimum* (misal > 9 poin).
5. Urutkan kandidat berskor tertinggi. Jika kandidat urutan ke-1 memiliki skor tunggal teratas, elemen tersebut langsung dipilih.
6. Apabila *tie* (ada beberapa elemen berskor sama): filter menggunakan perhitungan nilai indeks kemunculan `ordinal` di DOM. Bila tetap seri, *throw* error *Ambiguous field resolution* ke log field tersebut.

## Deteksi Label Bersih & Elemen Konteks
Teks label harus disanitasi:
1. Clone elemen field (`el.cloneNode(true)`).
2. Cabut elemen `.q-icon`, `.material-icons`, `.q-field__native`, `[aria-hidden="true"]` dari klon tersebut.
3. Ambil `textContent` sisa, buang ekstra-whitespace.

Teks `contextLabel`:
Menyusuri DOM ke elemen `previousElementSibling` pada node asal dan *ancestor* sampai maksimum kedalaman 4 tingkat, lalu mencari node teks di dalamnya yang panjangnya kurang dari 80 karakter dan di dalamnya tidak terdapat tag form-control.

## Daftar Pola ID Tidak Stabil (Auto-Generated ID)
Filter pencarian ID akan melewati Regex checker. ID yang mematuhi regex ini dianulir (dianggap kosong dan tidak disimpan):
- Quasar: `/^f_[0-9a-f]{8}-/i` (dimulai dengan `f_<uuid>`)
- React 18: `/^:r/` (seperti `:r0:`, `:r1a:`)
- Vuetify: `/^v-/` atau `/^input-\d+/`
- Element Plus: `/^el-id-/`
- Headless UI: `/^headlessui-/`
- MUI: `/^mui-\d+/`

## Desain Perbaikan Adapter Quasar Select (`use-input`)
- Pengujian *Visibility* pada elemen `Teleport`: Gunakan pengecekan kombinasi dari `getComputedStyle(el).display !== 'none'`, `getComputedStyle(el).visibility !== 'hidden'`, dan `el.getClientRects().length > 0`.
- Menemukan Menu: Ambil input internal dari kontrol, ambil nilai string atribut `aria-controls`. Gunakan `document.getElementById` dari string kontrol ini untuk menemukan elemen menu, lalu navigasi ke root `.q-menu` (menggunakan `closest`). Apabila atribut `aria-controls` tidak ada, gunakan `MutationObserver` pada `document.body` saat mousedown untuk mem-buffer kemunculan `.q-menu` dengan class aktif yang terbaru (baru saja dilekatkan).
- Alur Event Native: Quasar mendeteksi urutan mouse event (pointerdown, mousedown, mouseup, click) ke root kontrol sebelum me-listen keyboard/input ke `input` native-nya. Kita menyimulasikannya.
- Pengecekan Akhir (Verification): Setelah menembakkan *click* ke opsi `.q-item`, pastikan `.q-field__native` pada field root memperbarui string-nya sesuai dengan nilai tersimpan.

## Risiko / Hal yang Ragu
- `MutationObserver` untuk fall-back `aria-controls`: Memunculkan menu mungkin terhambat animasi/delay CSS rendering. Observer perlu memuat *timeout* fallback.
- Context Label pada DOM kompleks: Traverse ke ancestor dengan limit kedalaman 4-tingkat dapat meleset mengambil teks header global bila struktur DOM sangat rapat. Ini dapat dimitigasi oleh skor bobot `contextLabel` yang kita tetapkan kecil (sekadar tie-breaker tambahan).
