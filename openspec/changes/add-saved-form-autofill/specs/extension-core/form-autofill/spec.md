# Spec Delta

## ADDED Requirements

### Requirement: Menyimpan State Form Berdasarkan URL
Sistem MUST mendeteksi URL aktif (origin + pathname, men-support perubahan SPA tanpa reload) dan memungkinkan user menyimpan nilai seluruh field form (kecuali password) di halaman tersebut ke dalam `chrome.storage.local`.

#### Scenario: Simpan data form pertama kali
- **WHEN** user berada di URL `/login?next=1` dan menekan tombol "Simpan form"
- **THEN** sistem mengekstrak dan menyimpan nilai form yang ada
- **AND** saat user membuka `/login?next=2`, data yang sama tetap dikenali sebagai data untuk pathname `/login`

#### Scenario: Bypass field tipe password
- **WHEN** user menekan tombol "Simpan form" pada halaman dengan input email dan password
- **THEN** nilai input email tersimpan, sedangkan nilai input password diabaikan

### Requirement: Pengisian Form Tersimpan Secara Sekuensial & Asinkron
Sistem SHALL mendukung tombol "Isi dari tersimpan" yang mengisi kembali nilai berdasarkan prioritas pencocokan (id, name, data-testid, aria-label, urutan DOM). Pengisian dilakukan secara berurutan, menunggu elemen dependent (disabled, hidden, select async) menjadi siap menggunakan MutationObserver.

#### Scenario: Field dependent yang muncul asinkron
- **WHEN** user memilih "Isi dari tersimpan" dan field "kota" awalnya dalam kondisi disabled
- **THEN** field "provinsi" terisi lebih dulu, memicu event framework
- **AND** sistem menunggu hingga field "kota" tidak lagi disabled sebelum mengisi nilainya, tanpa membutuhkan klik tambahan dari user

#### Scenario: Field tidak ditemukan setelah perubahan DOM
- **WHEN** DOM berubah (misal satu field dihapus oleh developer) dan user mencoba "Isi dari tersimpan"
- **THEN** field yang tidak ditemukan akan dilewati dan dilaporkan jumlahnya, misalnya "8 dari 10 field terisi"

### Requirement: Indikator Visual Data Tersimpan
Sistem MUST menampilkan indikator ketersediaan data tersimpan baik di UI popup maupun sebagai badge di ikon ekstensi. Field di halaman yang terisi dari data simpanan juga diberi penanda halus tanpa merusak layout.

#### Scenario: Badge ketersediaan data pada navigasi SPA
- **WHEN** user pindah route dari beranda ke halaman profil (di mana data pernah disimpan) via pushState SPA tanpa reload
- **THEN** indikator popup berubah dan badge toolbar muncul secara reaktif menandakan URL profil punya data tersimpan

### Requirement: Manajemen Data Form Tersimpan (Edit/Hapus)
Sistem SHALL menyediakan antarmuka dalam popup ekstensi untuk melihat, mengubah secara manual, dan menghapus nilai yang sudah tersimpan per field maupun keseluruhan untuk suatu URL.

#### Scenario: Edit manual dari popup dipakai saat autofill
- **WHEN** user mengubah nilai field tersimpan secara manual melalui popup
- **THEN** pada operasi "Isi dari tersimpan" berikutnya, nilai yang sudah diedit tersebut yang digunakan untuk mengisi field di DOM
