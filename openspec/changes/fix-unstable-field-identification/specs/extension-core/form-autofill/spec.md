# Spec Delta

## MODIFIED Requirements

### Requirement: Deteksi Field Form
Sistem MUST mendeteksi elemen input, select, dan textarea pada DOM yang aktif, serta mengekstrak informasi relevan untuk keperluan penyimpanan.
Sistem MUST mengumpulkan beberapa pengenal kandidat yang stabil secara berurutan: `data-testid`/`data-cy`/`data-test`, `name`, `id` (jika bukan *auto-generated*), `aria-label`, teks label terkait, `placeholder`, konteks posisi, dan terakhir *path DOM*. Sistem MUST membuang teks kotor seperti nilai yang terpilih atau ikon ligatur dari label. Sistem MUST mengidentifikasi dan mengabaikan atribut `id` yang di-*generate* secara dinamis oleh framework UI. Untuk field berupa dropdown, sistem juga harus menyimpan `kind`, `value` (jika tersedia), serta `label` (teks bersih yang nampak).

#### Scenario: Mengisi form yang dikenali
- **WHEN** user menekan tombol Fill dan elemen DOM merupakan input berjenis email
- **THEN** sistem mengisinya dengan format alamat email yang valid
- **AND** field yang tidak memiliki pola yang dikenali dibiarkan kosong

#### Scenario: Menyimpan field dropdown dengan format baru
- **WHEN** user menekan tombol "Simpan form" dan terdapat elemen dropdown
- **THEN** sistem mengekstrak dan menyimpan objek field yang memuat `kind`, `value`, dan `label` dengan benar
- **AND** format penyimpanan lama (yang hanya memiliki `value` berupa teks label) masih dipertahankan untuk kompatibilitas

#### Scenario: Menyimpan field dengan id yang tidak stabil dan teks kotor
- **WHEN** form memiliki `q-select` dengan teks label bercampur ikon `arrow_drop_down` dan memiliki `id` acak `f_1234`
- **THEN** sistem menolak menggunakan `id` tersebut sebagai pengenal
- **AND** sistem merekam label bersih tanpa teks ikon atau nilai yang terpilih, dan/atau menggunakan *fallback* posisi kontekstual sebagai pengenal

### Requirement: Eksekusi Autofill
Sistem SHALL mendukung trigger pengisian melalui klik tombol "Isi form" di UI ekstensi. Untuk dropdown, sistem mencari opsi berdasarkan `value` terlebih dahulu (jika native), lalu berdasarkan kecocokan eksak pada `label`, lalu berdasarkan kecocokan parsial (`includes`), sembari menunggu proses loading asinkron atau dependency (maksimal 5 detik). Sistem juga harus mendukung membaca format data lama yang hanya menggunakan string di properti `value`. Jika suatu dropdown gagal terisi, sistem harus melaporkannya ke pengguna tanpa menghentikan proses pengisian field lain.
Pada proses pencocokan semua jenis field, sistem MUST mencoba mencocokkan field berdasarkan beberapa kandidat pengenal secara berurutan, mengabaikan ID auto-generated dan membersihkan label dari data historis, serta menangani pencocokan elemen jamak (ambigu).

#### Scenario: Field sudah memiliki nilai (tanpa overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" dan opsi overwrite tidak aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut tetap "John Doe"

#### Scenario: Field sudah memiliki nilai (dengan overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" namun opsi overwrite dalam keadaan aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut ditimpa dengan nama fiktif yang baru digenerate

#### Scenario: Mengisi field dengan data format lama dan baru
- **WHEN** user mengeksekusi "Isi form" dengan data lama (hanya string value) dan data baru (memiliki kind dan label spesifik)
- **THEN** sistem berhasil mengisi kedua format data dengan benar

#### Scenario: Melaporkan kegagalan pengisian spesifik
- **WHEN** suatu opsi dropdown tidak dapat ditemukan setelah batas waktu pencarian
- **THEN** field tersebut dilewati, proses dilanjutkan ke field berikutnya, dan UI menampilkan notifikasi peringatan berisi nama field yang gagal beserta alasan spesifiknya

#### Scenario: Mengisi form setelah halaman direload (id auto-generated berubah)
- **WHEN** data form disimpan dengan id acak `f_1234` namun saat direload elemen tersebut mendapatkan id `f_5678`
- **THEN** sistem berhasil menemukan elemen tersebut dan mengisinya dengan mengabaikan atribut `id` dan menggunakan fallback pengenal yang stabil

#### Scenario: Melaporkan kegagalan menemukan field yang ramah pengguna
- **WHEN** elemen gagal ditemukan sama sekali atau lebih dari satu elemen cocok (ambigu)
- **THEN** sistem melewati field tersebut, melaporkannya di UI dengan memunculkan pesan gagal yang mencantumkan nama field yang bersih beserta alasan, tanpa menampilkan id framework internal
