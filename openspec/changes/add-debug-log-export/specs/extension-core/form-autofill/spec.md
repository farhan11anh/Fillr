# Spec Delta

## MODIFIED Requirements

### Requirement: Deteksi Field Form
Sistem MUST mendeteksi elemen input, select, dan textarea pada DOM yang aktif berdasarkan prinsip "field root", di mana untuk framework UI seperti Quasar, elemen terluar kontrol (`.q-field`) dinormalisasi sebagai representasi 1 field. Sistem mengekstrak informasi relevan (id, name, tipe, testId, label, dan indeks DOM) untuk keperluan penyimpanan. Untuk field berupa dropdown (termasuk native, `q-select`, dan aria combobox), sistem juga harus menyimpan `kind` (jenis adapter), `value` (jika tersedia), serta kumpulan label. Proses ekstraksi label harus diprioritaskan sebagai berikut: (1) `.q-field__label`, (2) `aria-label`/`aria-labelledby`, (3) elemen `<label>` rujukan, (4) `contextLabel` dari teks terdekat sebelumnya, dan (5) `placeholder`. Pencarian `contextLabel` wajib menaiki hierarki DOM (ancestor) dan menelusuri elemen layout terdekat (termasuk di dalam pembagian grid/kolom terpisah) yang berisi teks representatif tak membungkus input. Teks label harus dibersihkan dari nilai terpilih dan elemen dekoratif/ikon. Format penyimpanan juga wajib memuat properti tambahan: `contextLabel`, `stableId` (non auto-generated), dan `ordinal`. Sistem MUST mengirim ringkasan proses ke logger jika mode debug aktif, meliputi: jumlah field yang terdeteksi, field yang berhasil tersimpan, field yang dilewati (beserta alasan), dan pengenal (identifier) akhir yang disimpan untuk tiap field.

#### Scenario: Mengisi form yang dikenali
- **WHEN** user menekan tombol Fill dan elemen DOM merupakan input berjenis email
- **THEN** sistem mengisinya dengan format alamat email yang valid
- **AND** field yang tidak memiliki pola yang dikenali dibiarkan kosong

#### Scenario: Menyimpan field dropdown dengan format baru
- **WHEN** user menekan tombol "Simpan form" dan terdapat elemen dropdown
- **THEN** sistem mengekstrak dan menyimpan objek field yang memuat `kind`, `value`, `label`, `contextLabel`, `stableId`, dan `ordinal` dengan benar
- **AND** format penyimpanan lama (yang hanya memiliki `value` berupa teks label) masih dipertahankan untuk kompatibilitas

#### Scenario: Melewati form field yang tersembunyi (hidden/disabled)
- **WHEN** elemen form memiliki atribut `type="hidden"`, `disabled`, atau dirender dengan `display: none`
- **THEN** field tersebut dilewati dan tidak masuk dalam proses autofill

#### Scenario: Mencatat log ringkasan penyimpanan form
- **WHEN** user menekan "Simpan form" dan mode debug dalam keadaan aktif
- **THEN** proses deteksi memancarkan log statistik penyimpanan (jumlah ditemukan, disimpan, dilewati, alasan, dan identifier field)

### Requirement: Eksekusi Autofill
Sistem SHALL mendukung trigger pengisian melalui klik tombol "Isi form" di UI ekstensi. Proses pencarian elemen kandidat pada halaman dilakukan melalui mekanisme *resolver* berbasis skor bobot (scoring system) dari atribut kecocokan data tersimpan. Apabila terdapat ambiguitas kandidat, sistem akan menyelesaikannya menggunakan indikator `ordinal` posisi DOM. Interaksi pada dropdown spesifik seperti `q-select` Quasar wajib divalidasi kemunculan menunya secara robust menggunakan kalkulasi komputasi `getComputedStyle` dan `getClientRects()` (bukan properti `offsetParent` saja), dan menu dicari melalui atribut `aria-controls` atau fallback perbandingan snapshot pasca interaksi. Pengisian wajib memicu seluruh alur event asinkron interaksi secara utuh (termasuk pointerdown, mousedown, mouseup, klik, event input). Untuk elemen yang datanya dimuat secara *async*, sistem harus menunggu dan mendeteksi kondisi hilangnya spinner loading, memastikan tidak menemui status "Tidak ada data", serta menerapkan pencocokan ganda: opsi exact-match tervalidasi lalu partial-match. Semua interaksi ini diakhiri dengan verifikasi pasca-pengisian. Jika suatu dropdown atau field gagal terisi, sistem harus melewati proses tersebut dan melaporkannya ke pengguna secara spesifik tanpa menghentikan proses autofill keseluruhan. Setiap interaksi pengisian per field MUST dilaporkan ke sistem logger apabila mode debug aktif, mencakup: pengenal yang dicoba, skor/kandidat yang ditemukan, jalur yang dipakai (seperti `vue-instance` atau `native`), hasil akhir operasi, alasan kegagalan jika ada, serta durasi waktu pemrosesan, yang dirangkum menjadi satu grup console (console group) logikal.

#### Scenario: Field sudah memiliki nilai (tanpa overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" dan opsi overwrite tidak aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut tetap "John Doe"

#### Scenario: Field sudah memiliki nilai (dengan overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" namun opsi overwrite dalam keadaan aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut ditimpa dengan nama fiktif yang baru digenerate

#### Scenario: Mengisi field dengan data format lama dan baru
- **WHEN** user mengeksekusi "Isi form" dengan data lama (hanya string value tanpa properti baru) dan data baru (memiliki kelengkapan profil fingerprint)
- **THEN** sistem berhasil mengisi kedua format data dengan benar karena resolver memberikan skor dari nilai properti yang ada saja

#### Scenario: Nilai gagal dikonversi ke tipe field
- **WHEN** field mengharuskan nilai numerik namun data yang akan diisikan berupa string huruf
- **THEN** sistem mengabaikan pengisian field tersebut (graceful degradation) dan melanjutkan ke field lain

#### Scenario: Resolusi kandidat multi-elemen
- **WHEN** terdapat dua input dengan id yang sama namun posisi (ordinal) berbeda
- **THEN** mekanisme resolver memilih elemen berdasarkan kalkulasi ordinal relatif terdekat dengan urutan penyimpanan

#### Scenario: Melaporkan kegagalan pengisian spesifik
- **WHEN** suatu opsi dropdown tidak dapat ditemukan setelah batas waktu pencarian
- **THEN** field tersebut dilewati, proses dilanjutkan ke field berikutnya, dan UI menampilkan notifikasi peringatan berisi nama field murni yang gagal beserta alasan spesifiknya

#### Scenario: Mencatat log pelacakan pengisian field
- **WHEN** ekstensi sedang mengisi suatu field dan mode debug aktif
- **THEN** proses pengisian tersebut terekam dalam console log lengkap dengan identitas percobaan, jalur yang digunakan (seperti `vue-instance`), hasil eksekusi, serta durasi waktu eksekusinya
