# Proposal

## Why
Developer sering membuang waktu secara manual untuk menduplikasi state aplikasi yang tersimpan di localStorage dari satu environment/tab (seperti tab testing) ke tab lain (seperti tab dev). Proses ini memerlukan buka-tutup DevTools, copy-paste data satu persatu yang memakan waktu. Fitur ini akan mengotomatisasi pemindahan data localStorage antartab hanya dengan satu klik secara presisi.

## What Changes
- Menambahkan fitur "Transfer localStorage" dalam Mode Dev Tools dari ekstensi Fillkit.
- Membuat antarmuka popup yang memiliki dua dropdown (Tab sumber dan Tab tujuan) yang difilter khusus untuk tab yang valid.
- Membuat satu tombol eksekusi tunggal dengan workflow 4 tahap: clear destination, reload destination, transfer data, reload destination.
- Mengimplementasikan indikator progres multi-step di popup.
- Menyuntikkan log proses (tanpa membocorkan nilai localStorage) ke dalam console di tab tujuan, dan mencetak di console popup.
- Menangani berbagai edge cases (kegagalan reload, perubahan origin saat transfer, sumber dan tujuan sama, dll).

## Capabilities

### New Capabilities
- `extension-core/localstorage-transfer`: Mentransfer localStorage dari satu tab ke tab lain dengan urutan (clear, reload, transfer, reload) dan pencegahan error secara aman.

### Modified Capabilities
- (None)

## Impact
- **Permissions**: Harus menggunakan `optional_host_permissions` saat eksekusi runtime per-origin, sebab permission `activeTab` saja tidak memadai untuk menyuntikkan script pada lebih dari satu tab secara bersamaan tanpa interaksi klik langsung dari pengguna di kedua tab tersebut.
- **Scope**: Fokus pada top-level frame localStorage; tidak melibatkan sessionStorage atau cookie.
