# Spec Delta

## ADDED Requirements

### Requirement: Deteksi dan Ekstraksi Nilai Dropdown
Sistem SHALL mendukung pembacaan dan penyimpanan nilai dropdown, baik elemen native `<select>` maupun dropdown kustom dari library UI (seperti Quasar `q-select` atau elemen dengan atribut ARIA combobox), berdasarkan teks opsi yang terlihat oleh pengguna.

#### Scenario: Ekstraksi nilai q-select single dan multiple
- **WHEN** user menekan tombol simpan form pada form yang memiliki Quasar `q-select` single (satu teks terpilih) dan multiple (berupa chip)
- **THEN** sistem berhasil membaca dan menyimpan teks dari label opsi yang terpilih dari kedua field tersebut

### Requirement: Pengisian Otomatis Dropdown Kustom
Sistem MUST mampu meniru perilaku interaksi pointer/mouse untuk membuka dropdown kustom, menunggu kemunculan opsi (dengan timeout tertentu, misal 5 detik), memfilter (jika ada input text filter), dan mengklik opsi yang persis atau mirip dengan teks yang tersimpan. 

#### Scenario: Pengisian dropdown async dan terfilter
- **WHEN** dropdown `q-select` dengan `use-input` diproses untuk diisi
- **THEN** sistem membuka dropdown, mengetik teks tersimpan, menunggu opsi dimuat secara asinkron, dan memilih opsi yang cocok

#### Scenario: Penutupan menu dropdown
- **WHEN** proses pengisian satu field dropdown selesai
- **THEN** menu dropdown di layar secara otomatis tertutup sehingga tidak menghalangi elemen lain

### Requirement: Dukungan Dropdown Dependen
Sistem SHALL menangani pengisian dropdown yang bergantung pada dropdown lain (misalnya dropdown 'Kota' yang opsi-nya baru dimuat setelah 'Provinsi' terisi) dengan menunggu field tujuan menjadi aktif sebelum mencoba mengisinya.

#### Scenario: Provinsi dan Kota terisi otomatis
- **WHEN** dropdown 'Kota' dalam keadaan disabled menunggu dropdown 'Provinsi' dipilih
- **THEN** sistem mengisi dropdown 'Provinsi', menunggu dropdown 'Kota' tidak disabled dan memuat opsi-opsinya, lalu mengisi dropdown 'Kota' dalam satu alur klik autofill

### Requirement: Pelaporan Error Spesifik
Sistem SHALL mengevaluasi keberhasilan pengisian field secara individual. Jika suatu field gagal diisi (karena opsi tidak ditemukan atau timeout), sistem melaporkan alasan spesifik untuk field tersebut tanpa menghentikan pengisian field yang lain.

#### Scenario: Opsi tidak ditemukan
- **WHEN** sistem gagal menemukan opsi yang cocok dengan nilai yang tersimpan di dalam dropdown
- **THEN** sistem mencatat nama field dan alasan kegagalannya, lalu melanjutkan proses autofill ke field selanjutnya, dan pada akhirnya melaporkan field mana saja yang gagal
