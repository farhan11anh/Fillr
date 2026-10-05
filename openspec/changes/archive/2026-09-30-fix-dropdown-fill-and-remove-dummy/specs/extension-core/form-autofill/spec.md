# Spec Delta

## REMOVED Requirements

### Requirement: Generate Data Dummy Fiktif
**Reason**: Fitur pengisian data dummy fiktif tidak lagi digunakan dan fokus ekstensi kini beralih sepenuhnya pada penyimpanan dan pengisian ulang data form berdasarkan sesi pengguna.
**Migration**: Gunakan fitur "Simpan form" pada halaman yang bersangkutan, lalu "Isi form" untuk memuat kembali data yang tersimpan.

## MODIFIED Requirements

### Requirement: Deteksi Field Form
Sistem MUST mendeteksi elemen input, select, dan textarea pada DOM yang aktif, serta mengekstrak informasi relevan (id, name, tipe, testId, label, dan indeks DOM) untuk keperluan penyimpanan. Untuk field berupa dropdown (termasuk native, `q-select`, dan aria combobox), sistem juga harus menyimpan `kind` (jenis adapter), `value` (jika tersedia), serta `label` (teks yang nampak).

#### Scenario: Menyimpan field dropdown dengan format baru
- **WHEN** user menekan tombol "Simpan form" dan terdapat elemen dropdown
- **THEN** sistem mengekstrak dan menyimpan objek field yang memuat `kind`, `value`, dan `label` dengan benar
- **AND** format penyimpanan lama (yang hanya memiliki `value` berupa teks label) masih dipertahankan untuk kompatibilitas

### Requirement: Eksekusi Autofill
Sistem SHALL mendukung trigger pengisian melalui klik tombol "Isi form" di UI ekstensi. Untuk dropdown, sistem mencari opsi berdasarkan `value` terlebih dahulu (jika native), lalu berdasarkan kecocokan eksak pada `label`, lalu berdasarkan kecocokan parsial (`includes`), sembari menunggu proses loading asinkron atau dependency (maksimal 5 detik). Sistem juga harus mendukung membaca format data lama yang hanya menggunakan string di properti `value`. Jika suatu dropdown gagal terisi, sistem harus melaporkannya ke pengguna tanpa menghentikan proses pengisian field lain.

#### Scenario: Mengisi field dengan data format lama dan baru
- **WHEN** user mengeksekusi "Isi form" dengan data lama (hanya string value) dan data baru (memiliki kind dan label spesifik)
- **THEN** sistem berhasil mengisi kedua format data dengan benar

#### Scenario: Melaporkan kegagalan pengisian spesifik
- **WHEN** suatu opsi dropdown tidak dapat ditemukan setelah batas waktu pencarian
- **THEN** field tersebut dilewati, proses dilanjutkan ke field berikutnya, dan UI menampilkan notifikasi peringatan berisi nama field yang gagal beserta alasan spesifiknya
