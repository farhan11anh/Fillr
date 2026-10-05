# Tasks

## 1. Preparation & Logic Utility

- [x] 1.1 Buat `utils/tabHelpers.ts` untuk fungsi `chrome.tabs.query` yang mendapatkan daftar tab terbuka, memfilter tab yang tidak valid (chrome://, edge://, Chrome Web Store). Verifikasi fungsi me-return array tab yang valid saat dipanggil di console/test.
- [x] 1.2 Buat `utils/transferCoordinator.ts` yang berisi fungsi orchestrator `transferLocalStorage(sourceTabId, destTabId)`. Fungsi ini mengatur alur 4 tahap (clear, reload, transfer, reload), menangani timeout reload via `chrome.tabs.onUpdated`, dan request permission (`chrome.permissions.request`). Verifikasi kompilasi TypeScript berhasil tanpa error.

## 2. Operasi LocalStorage (Injeksi)

- [x] 2.1 Tambahkan fungsi untuk membaca localStorage (`getLocalStorage`) dan membersihkan localStorage (`clearLocalStorage`) yang akan dieksekusi via `chrome.scripting.executeScript`. Verifikasi fungsi dapat membaca dan mengembalikan snapshot objek localStorage dari tab sumber secara akurat.
- [x] 2.2 Tambahkan fungsi untuk menulis ke localStorage (`setLocalStorage`) dan mencetak log ke console bawaan halaman. Verifikasi saat dieksekusi, data localStorage berhasil tertulis dan log konsisten (tanpa membocorkan value) muncul di DevTools tab tujuan.

## 3. UI Integration (Dev Tools Mode)

- [x] 3.1 Buat komponen `LocalStorageTransfer.vue` di dalam direktori `modes/devtools`. Tambahkan dua dropdown (Sumber dan Tujuan) yang datanya di-fetch dari `tabHelpers.ts`. Verifikasi dropdown terisi otomatis saat komponen di-mount dan user tidak dapat memilih origin tujuan yang sama dengan sumber (disabled state atau error message).
- [x] 3.2 Hubungkan tombol tunggal "Transfer" di komponen dengan fungsi di `transferCoordinator.ts`. Tambahkan proteksi agar jika localStorage sumber kosong, konfirmasi (confirm dialog) akan menahan eksekusi. Verifikasi fungsi meminta persetujuan permission runtime dengan benar.
- [x] 3.3 Tambahkan elemen UI reaktif (state `waiting` / `running` / `success` / `failed`) yang memantau kemajuan langkah ke 1-4. Verifikasi bahwa UI memberikan feedback real-time termasuk pesan error spesifik jika terjadi timeout atau kegagalan origin match di tengah jalan.
