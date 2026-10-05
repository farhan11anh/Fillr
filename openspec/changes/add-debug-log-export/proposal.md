# Proposal

## Why

Proses pengisian form otomatis, khususnya pada komponen kompleks seperti `q-select`, rentan terhadap kegagalan (elemen tidak ditemukan, dropdown tidak bereaksi, atau pilihan tidak ada). Saat user melaporkan masalah ini, developer kesulitan melakukan diagnosis (debugging) karena tidak ada rekam jejak mengenai kandidat elemen mana yang terdeteksi, atribut apa yang digunakan sebagai pengenal, atau jalur apa yang diambil ekstensi. Dengan menyediakan sistem log debug internal yang tersamar (redacted) dan mudah disalin, proses investigasi kegagalan spesifik di environment user dapat dilakukan secara efisien.

## What Changes

- Menambahkan fungsi logger ringan `dlog` (di-store dalam memory *ring buffer* berkapasitas 500 baris) di dalam *content script* untuk mencatat langkah-langkah resolusi, ekstraksi, dan interaksi.
- Menambahkan integrasi logging pada sesi "Isi form" untuk mencatat detail setiap operasi field: pengenal yang dicoba, skor/jumlah kandidat, jalur interaksi (misal: vue-instance / native), hasil (sukses/gagal), alasan kegagalan, dan durasi pengisian. Hasil dicetak menggunakan `console.groupCollapsed` per sesi.
- Menambahkan integrasi logging pada sesi "Simpan form" untuk mencatat ringkasan (jumlah field terdeteksi, tersimpan, dan dilewati beserta alasannya) dan metadata pengenal.
- Menerapkan penyamaran data privasi secara default: semua nilai field (value) yang diketik/diisi diganti menjadi representasi panjangnya (misal `[String length 5]`). Field `password` dan nilainya sama sekali tidak dicatat. Label dropdown dan contextLabel diperbolehkan dicatat untuk konteks UI.
- Menambahkan *toggle* "Mode debug" pada *Popup UI* yang menyimpan statusnya di `chrome.storage.local`. Pencatatan log hanya aktif jika mode ini dinyalakan.
- Menambahkan tombol "Salin log debug" pada *Popup UI* yang bertugas memanggil log dari tab aktif lalu menyalin output JSON ke clipboard.
- Siklus hidup log dibatasi per siklus muat halaman; reload halaman akan mengosongkan ring buffer.

## Capabilities

### New Capabilities
- `extension-core/debug-log`: Sistem pencatatan log memori terbatas dengan fitur penyamaran data (redaction) dan antarmuka ekspor (salin clipboard) melalui popup.

### Modified Capabilities
- `extension-core/form-autofill`: Mewajibkan proses ekstraksi dan pengisian (resolver) untuk mengirim log jejak eksekusi secara detail (kandidat, durasi, jalur) ke sistem debug saat beroperasi.

## Impact

- **Content Scripts (`fillSavedForm`, `extractForm`)**: Perlu dimodifikasi untuk memancarkan log kaya metadata.
- **Utils**: Pembuatan `src/utils/debug.ts` baru.
- **Popup UI (`AutofillMode.vue`)**: Penambahan state "Debug Mode" dan tombol interaksi penyalinan.
- **Privasi**: Tidak ada log yang dikirim ke server luar, menjaga ekstensi tetap berjalan secara lokal penuh (local-first) dengan memori terbatas.
