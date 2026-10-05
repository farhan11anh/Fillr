# extension-core/mode-switcher Specification

## Purpose

Mengatur mode operasi ekstensi (Autofill dan Dev Tools) dan memastikan UI ekstensi selalu mengingat preferensi mode terakhir pengguna antar-sesi.

## Requirements

### Requirement: Mode Default Ekstensi
Saat ekstensi dibuka untuk pertama kali (belum ada data tersimpan di storage), mode yang aktif haruslah Autofill.

#### Scenario: Popup dibuka pertama kali
- **WHEN** user membuka popup ekstensi pertama kali setelah instalasi
- **THEN** mode yang aktif dan ditampilkan adalah "Autofill"

### Requirement: Persistensi Pilihan Mode
Ekstensi harus mengingat pilihan mode terakhir yang dipilih user menggunakan `chrome.storage.local`.

#### Scenario: Mengingat mode yang dipilih setelah popup ditutup
- **WHEN** user memilih mode "Dev Tools" di dalam popup
- **AND** user menutup popup dan membukanya kembali
- **THEN** mode yang aktif dan ditampilkan tetap "Dev Tools"

### Requirement: Validitas Ekstensi Manifest V3
Ekstensi harus valid sesuai standar Manifest V3 dan bebas error saat instalasi.

#### Scenario: Load unpacked
- **WHEN** folder ekstensi di-load menggunakan fitur "Load unpacked" di Chrome `chrome://extensions`
- **THEN** ekstensi berhasil terpasang tanpa menimbulkan error di console maupun halaman ekstensi

### Requirement: Minimisasi Permission
Manifest hanya mendeklarasikan permission minimum yang diperlukan untuk fase awal ini tanpa access luas.

#### Scenario: Validasi daftar permission
- **WHEN** `manifest.json` dievaluasi
- **THEN** atribut `permissions` hanya berisi `storage`, `activeTab`, dan `scripting`
