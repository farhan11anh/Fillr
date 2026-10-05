# Design

## Context
Fitur transfer localStorage memerlukan intervensi terhadap dua tab berbeda yang sedang terbuka. Pada Manifest V3, ekstensi memiliki limitasi keamanan di mana permission `activeTab` hanya berlaku untuk tab aktif saat ini di window tempat pengguna membuka popup. Karena kita perlu menginjeksi script (membaca localStorage) dari tab sumber dan memodifikasi localStorage pada tab tujuan (yang bisa jadi sedang di background), mekanisme manajemen permission harus diperhitungkan dengan saksama. 

## Goals / Non-Goals

**Goals:**
- Merancang alur eksekusi asinkron 4 langkah yang robust.
- Mengatur skema perizinan (permissions) yang aman tanpa meminta akses universal `*://*/*` (yang akan diblokir Chrome Web Store).

**Non-Goals:**
- Merancang UI yang rumit (cukup UI popup standar yang mudah dipakai).
- Menyimpan cache localStorage secara permanen antar sesi ekstensi.

## Decisions

### 1. Pendekatan Eksekusi Lintas Tab (Message Coordinator)
**Rationale:** Proses eksekusi akan diorkestrasi langsung di script Vue/popup atau sebuah composable khusus. Seluruh logika (clear, reload, transfer, reload) dibungkus dalam sebuah fungsi `async/await` yang berurutan. Snapshot localStorage sumber hanya akan berada di RAM (memori lokal dari script orkestrator) dan akan langsung dihapus setelah satu flow transfer selesai.
**Alternatives:** Menggunakan background script/service worker untuk mengoordinasi. *Rejected* karena akan lebih rumit (butuh saling kirim message) dan state localStorage berisiko "zombie" jika transfer gagal. Popup script cukup karena popup akan tetap terbuka jika difokuskan, atau kita bisa mendelegasikannya ke background script jika kita ingin popup boleh tertutup. Karena ini "Satu Klik", popup script sudah cukup jika pengguna menunggu beberapa detik. (Pengecualian: Chrome akan menutup popup jika user klik di luar. Jika ini masalah, koordinasi ditaruh di `background.ts`).

### 2. Manajemen Permission Eksekusi
**Rationale:** Daripada mendaftarkan `host_permissions: ["<all_urls>"]` yang berisiko pada review Web Store, kita akan menggunakan `chrome.permissions.request({ origins: [sourceOrigin + '/*', destOrigin + '/*'] })` tepat sebelum memulai eksekusi. User akan diprompt untuk memberikan izin ekstra saat runtime.
**Alternatives:** Mewajibkan user menyalakan izin "On all sites" secara manual. *Rejected* karena UX-nya buruk.

### 3. Pemantauan Reload (chrome.tabs.onUpdated)
**Rationale:** Untuk memantau selesainya sebuah reload, script akan membungkus `chrome.tabs.onUpdated` ke dalam Promise. Promise ini me-resolve jika tabId cocok dan `changeInfo.status === 'complete'`, dan me-reject jika timer `setTimeout` (15 detik) menyala.

### 4. Pencegahan Eksekusi Beda Origin
**Rationale:** Tepat sebelum mengeksekusi transfer pada langkah ke-3, akan dilakukan cek ulang dengan `chrome.tabs.get(destTabId)` untuk memastikan `url` tab tujuan originnya masih sama dengan origin awal tujuan.

## Risks / Trade-offs

- **[Risk]** Popup ekstensi tertutup tanpa disengaja oleh pengguna di tengah proses 4 tahap (sehingga proses mati).
  **Mitigation:** Karena durasinya sangat sebentar (hanya butuh waktu reload halaman 2 kali), kita asumsikan user menunggu popup sampai selesai. Jika dirasa ini sangat krusial, logika orkestrator akan dipindah ke `background.ts` yang dikirim message dari popup. Untuk iterasi ini, koordinasi akan diletakkan di `background.ts` agar aman dari kasus popup tertutup.
- **[Risk]** Data localStorage tujuan memiliki nilai penting sebelum di-clear.
  **Mitigation:** Validasi sumber tidak boleh kosong; jika sumber kosong (length === 0), kita gunakan `window.confirm` untuk mencegah penghapusan sepihak.
