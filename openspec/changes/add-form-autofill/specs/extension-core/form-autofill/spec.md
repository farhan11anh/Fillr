# Spec Delta

## Purpose

Mengotomatisasi pengisian field form secara cepat dengan data fiktif untuk mempercepat proses testing dan pengembangan bagi developer frontend.

## ADDED Requirements

### Requirement: Deteksi Field Form
Sistem MUST mendeteksi elemen input, select, dan textarea pada DOM yang aktif, serta mencocokkan field berdasarkan atribut tipe, nama, ID, label, placeholder, dan autocomplete.

#### Scenario: Mengisi form yang dikenali
- **WHEN** user menekan tombol Fill dan elemen DOM merupakan input berjenis email
- **THEN** sistem mengisinya dengan format alamat email yang valid
- **AND** field yang tidak memiliki pola yang dikenali dibiarkan kosong

### Requirement: Generate Data Dummy Fiktif
Sistem MUST mampu menghasilkan data dummy (seperti NIK, nomor rekening, nomor telepon, dll) dalam locale Indonesia dan Inggris yang secara eksplisit tidak valid di dunia nyata namun lolos validasi client-side.

#### Scenario: Generate field telepon
- **WHEN** user mengeksekusi autofill pada input telepon
- **THEN** sistem mengisi field dengan string nomor acak yang tampak seperti format telepon sesuai locale

### Requirement: Eksekusi Autofill
Sistem SHALL mendukung trigger pengisian baik melalui klik tombol "Fill" di UI ekstensi maupun lewat shortcut keyboard, dan tidak menimpa nilai yang sudah ada kecuali diminta.

#### Scenario: Field sudah memiliki nilai (tanpa overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" dan opsi overwrite tidak aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut tetap "John Doe"

#### Scenario: Field sudah memiliki nilai (dengan overwrite)
- **WHEN** field input sudah memiliki teks "John Doe" namun opsi overwrite dalam keadaan aktif
- **AND** user menekan tombol Fill
- **THEN** nilai pada field tersebut ditimpa dengan nama fiktif yang baru digenerate

### Requirement: Kompatibilitas Framework
Sistem MUST memancarkan serangkaian event native (input, change, blur) ke DOM elemen yang dimodifikasi, agar state internal framework modern (v-model di Vue, controlled state di React/Angular) tersinkronisasi.

#### Scenario: Trigger framework reactivity
- **WHEN** data dimasukkan ke dalam elemen input oleh script autofill
- **THEN** elemen memancarkan Event 'input' diikuti 'change' dan 'blur', menyebabkan state framework ter-update secara reaktif

### Requirement: Manajemen Profile Autofill
Sistem SHALL menyediakan kemampuan menyimpan dan memuat lebih dari satu pengaturan profile (misal: "Default", "Edge Case") di `chrome.storage.local`.

#### Scenario: Ganti profile sebelum fill
- **WHEN** user berpindah ke profil "Edge Case" pada popup sebelum menekan Fill
- **THEN** form diisi dengan pengaturan dan preferensi dari profil "Edge Case" tersebut
