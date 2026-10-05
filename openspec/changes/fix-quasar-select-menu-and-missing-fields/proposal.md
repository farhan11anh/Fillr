# Proposal

## Why

Pada Quasar UI, komponen `q-select` yang menggunakan `emit-value` dan `map-options` hanya menampilkan teks label opsi yang terpilih di dalam elemen DOM. Nilai sesungguhnya (contoh: `institutionCode`) yang menjadi `v-model` hanya tersimpan di dalam *state* internal Vue. Saat ini, sistem `Fillr` hanya membaca teks dari DOM, sehingga kehilangan data relasional internal. Dengan mengakses instance Vue internal melalui *MAIN world script*, sistem dapat membaca dan menulis nilai sesungguhnya secara lebih andal sebagai jalur tambahan (bukan pengganti jalur DOM murni).

## What Changes

- Menambahkan *content script* (helper) yang berjalan di `world: 'MAIN'` untuk mengakses konteks eksekusi halaman agar bisa membaca `el.__vueParentComponent`.
- Membangun jembatan komunikasi via `window.postMessage` antara script ISOLATED dan MAIN.
- Menyimpan nilai `modelValue` langsung dari properti instance Vue saat menyimpan form, di samping data label DOM.
- Pada saat pengisian, mencoba memanggil `onUpdate:modelValue` secara langsung dari Vue instance apabila memungkinkan (menunggu data opsi termuat), lalu diverifikasi dengan bacaan label DOM.
- Menambahkan fallback ke metode pengisian lama (lewat klik DOM) jika Vue instance tak ditemukan (contoh: di mode produksi ketika properti dihapus) atau jika proses asinkron opsi gagal.
- Menyediakan diagnostic log per field terkait jalur yang digunakan (`vue-instance` atau `click-label`).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `extension-core/form-autofill`: Menambah jalur ekstraksi dan pengisian nilai spesifik komponen Vue internal (bypassing DOM state) sebagai pelengkap metode pengisian asinkron `q-select`.

## Impact

- **Content Scripts**: Penambahan script injeksi `MAIN world`.
- **Field Adapters / Extractors**: Penambahan logika komunikasi asinkron via `window.postMessage`.
- **Testing**: Kebutuhan menguji form pada environment Quasar dev (dimana `__vueParentComponent` tersedia) dan production (dimana tidak tersedia, memastikan fallback aman).
