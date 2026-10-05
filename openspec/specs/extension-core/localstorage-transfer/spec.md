# extension-core/localstorage-transfer

## Purpose

Memindahkan seluruh data localStorage dari satu tab ke tab lain dengan satu klik secara presisi, sehingga menghemat waktu saat memigrasi session testing.

## Requirements

### Requirement: Tampilan Dropdown Sumber dan Tujuan
Sistem MUST menampilkan dua dropdown, Tab Sumber dan Tab Tujuan, yang diisi dengan daftar tab yang ada pada browser saat ini. Sistem MUST mematikan opsi tab yang tidak bisa di-script (misalnya chrome://, edge://, atau Chrome Web Store).

#### Scenario: Pemilihan tab sumber dan tujuan yang valid
- **WHEN** popup ekstensi dibuka
- **THEN** user dapat melihat daftar tab untuk tab sumber dan tab tujuan yang berisi origin dan title tab
- **AND** opsi untuk tab `chrome://extensions` di-disable (tidak dapat dipilih)

### Requirement: Pencegahan Transfer Tab yang Sama
Sistem SHALL mencegah transfer localStorage jika tab sumber dan tab tujuan yang dipilih adalah tab yang sama.

#### Scenario: Sumber dan tujuan sama
- **WHEN** user memilih tab sumber "App Dev" dan tab tujuan "App Dev" (keduanya adalah tab yang sama)
- **THEN** tombol eksekusi menjadi nonaktif dan pesan jelas ditampilkan bahwa keduanya tidak boleh sama

### Requirement: Alur Eksekusi Transfer 4 Tahap
Sistem MUST mengeksekusi transfer dalam urutan tetap: Clear Destination, Reload Destination, Transfer Data, Reload Destination, hanya dengan sekali klik tanpa intervensi lanjutan, asalkan localStorage sumber tidak kosong.

#### Scenario: Transfer berhasil penuh
- **WHEN** user menekan tombol eksekusi dengan sumber tab A dan tujuan tab B
- **THEN** localStorage tab B di-clear
- **AND** halaman tab B direload
- **AND** setelah tab B selesai dimuat (status complete), semua data localStorage tab A (snapshot) disalin ke tab B
- **AND** halaman tab B direload sekali lagi agar aplikasi di tab B membaca state baru

#### Scenario: Konfirmasi saat sumber kosong
- **WHEN** user menekan tombol eksekusi dan localStorage tab A ternyata kosong
- **THEN** sistem menahan proses dan meminta konfirmasi sebelum meng-clear localStorage tab B agar data tujuan tidak hilang percuma

### Requirement: Penanganan Timeout dan Error Origin
Sistem SHALL memiliki batas timeout untuk menunggu reload tab (maksimal 15 detik), serta menghentikan proses jika tab tujuan ditutup atau beralih ke origin lain saat proses sedang berlangsung.

#### Scenario: Timeout saat reload
- **WHEN** sistem mereload tab tujuan dan waktu muat melebihi batas waktu 15 detik
- **THEN** proses transfer dihentikan secara permanen di langkah tersebut
- **AND** UI ekstensi menampilkan indikator error pada tahapan gagal

#### Scenario: Perubahan Origin
- **WHEN** setelah reload pertama tab tujuan meredirect ke origin lain (misal halaman login)
- **THEN** langkah transfer (langkah 3) tidak dijalankan
- **AND** proses dihentikan dengan log kegagalan

### Requirement: Logging di Console Tab Tujuan
Sistem MUST mencetak log pada popup ekstensi dan juga langsung ke Console DevTools pada tab tujuan, dengan format yang telah ditentukan, tanpa mencantumkan nilai sebenarnya dari localStorage.

#### Scenario: Cetak log sukses
- **WHEN** suatu langkah (misal langkah 3) selesai dengan sukses
- **THEN** log tercetak di console tab tujuan, misal: `[Fillkit] (3/4) transfer selesai: 5 key dari https://source.com ke https://dest.com`
- **AND** log tidak membocorkan sensitivitas value (hanya jumlah key dan origin)
