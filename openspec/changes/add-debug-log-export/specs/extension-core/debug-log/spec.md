# Spec Delta

## Purpose

Menyediakan sistem pencatatan log internal yang tersamar (redacted) dan mudah diekspor untuk membantu diagnosis kegagalan pengisian form di environment user.

## ADDED Requirements

### Requirement: Mode Debug
Sistem MUST memiliki toggle "Mode debug" pada UI ekstensi yang mengendalikan aktif-tidaknya pencatatan log diagnostik per-sesi operasi. Jika tidak diaktifkan, operasi form tidak akan mencatat data tambahan ke dalam memori log.

#### Scenario: Mengaktifkan mode debug
- **WHEN** user menyalakan toggle "Mode debug" pada popup
- **THEN** ekstensi menyimpan preferensi ini di `chrome.storage.local`
- **AND** proses pengisian/penyimpanan form selanjutnya akan memancarkan dan mencatat log

### Requirement: Rekam Log dan Ekspor
Sistem MUST merekam log diagnostik (dengan kapasitas cincin memori/ring buffer maksimum 500 entri) yang berisi catatan deteksi field, jalur interaksi, skor resolusi, dan durasi. Sistem MUST menyediakan mekanisme untuk menyalin log (dalam format JSON) ke clipboard dari tab aktif, dan memberikan konfirmasi keberhasilan.

#### Scenario: Ekspor log dari popup
- **WHEN** user menekan tombol "Salin log debug"
- **THEN** popup meminta kumpulan log dari *content script* di tab aktif
- **AND** popup menyalin hasil log dalam format terstruktur (JSON) ke clipboard user

#### Scenario: Batas memori log
- **WHEN** jumlah log melebihi 500 entri
- **THEN** entri log paling lama dihapus dari memori agar memori tetap efisien (Ring buffer)
- **AND** log otomatis dibersihkan saat halaman di-reload

### Requirement: Penyamaran Data (Redaction)
Sistem SHALL secara default melindungi privasi pengguna dengan tidak merekam nilai field asli ke dalam log. Nilai yang direkam MUST diubah menjadi informasi panjang karakternya saja (contoh: `[String length 5]`). Field yang bertipe `password` (beserta isinya) tidak akan pernah direkam nilainya ke dalam log. Pengecualian penyamaran hanya diberikan pada label dropdown dan label konteks (contextLabel) yang bersifat statis dari UI halaman.

#### Scenario: Mencatat nilai sensitif
- **WHEN** ekstensi mengisi form input dengan teks "Budi Santoso"
- **THEN** ekstensi mencatat ke dalam log sebagai nilai `[String length 12]`

#### Scenario: Mencatat nilai password
- **WHEN** ekstensi mendeteksi dan/atau berinteraksi dengan field bertipe `password`
- **THEN** ekstensi mencatat panjang nilai `password` tanpa pernah mencatat isi teks aslinya, atau nilai sama sekali tidak dicatat
