# Design

## Context

Lihat proposal.md untuk motivasi. `.q-menu` pada Quasar menggunakan properti CSS `position: fixed` untuk melayang di atas antarmuka, yang memicu `offsetParent === null` pada javascript asli. Pencarian `.q-menu` yang sekadar `querySelector` akan menemui menu pertama yang ada di DOM, sehingga saat ada banyak select, terjadi bentrok. Untuk field khusus tanpa properti name/label (masked input), teks penandanya berada pada kolom UI sebelahnya yang disatukan dalam wadah `.row`.

## Goals / Non-Goals

**Goals:**
- Mengimplementasikan mekanisme pendeteksian menu `.q-menu` yang presisi.
- Meningkatkan fungsi utilitas pelacak `contextLabel` untuk melihat saudara (sibling) di level *ancestor* yang lebih tinggi.
- Membuat pengisian data dropdown asinkron berhasil 100% dengan mensimulasikan klik native penuh dan penungguan (wait) cerdas.

**Non-Goals:**
- Membuat parser khusus per komponen/class framework. Penelusuran `contextLabel` akan tetap generik (hanya mengandalkan tag `<b>`, `<span>`, dll. yang cukup dekat).
- Menulis ulang seluruh adapter; hanya QuasarSelectAdapter dan modul utilitas yang diperbarui.

## Decisions

1. **Visibilitas Menu Dropdown**
   *Rationale*: Daripada memeriksa `offsetParent`, kita gunakan `getComputedStyle` untuk memeriksa `visibility` dan `display`, serta `getClientRects().length > 0` untuk memastikan elemen tersebut sedang ter-render di viewport.

2. **Resolusi Menu Spesifik via `aria-controls`**
   *Rationale*: Komponen input filter (yang menjadi bagian dari select Quasar) akan memiliki id unik yang merepresentasikan listbox. Dengan membaca `aria-controls`, kita dapat menarget id tertentu lalu mencari induk `.q-menu`-nya.
   *Alternatives*: Membandingkan DOM sebelum dan sesudah klik (sebagai fallback jika `aria-controls` hilang).

3. **Interaksi Native Lengkap & Smart Wait**
   *Rationale*: Opsi sering dimuat melalui fetch API ketika menu baru terbuka. Sistem harus mensimulasikan klik native secara lengkap (`pointerdown`, `mousedown`, `mouseup`, `click`), kemudian melakukan polling cerdas (`MutationObserver` atau `setInterval`) untuk menunggu indikator loading (`.q-spinner`) lenyap.

4. **Traversal Ancestor dalam `extractContextLabel`**
   *Rationale*: Karena label "ID Pasien" berada pada `.row` yang menampung kolom label dan kolom input, fungsi rekursif akan menaiki pohon DOM sejauh maksimal 4 tingkat. Di setiap tingkat, ia akan mengitari *previous sibling* untuk mencari tag teks pendek (≤ 80 karakter) yang relevan.

## Risks / Trade-offs

- **[Risk] Waktu tunggu (delay) bertambah** → **Mitigation**: Membatasi timeout pencarian opsi menu maksimum hingga 10 detik. Jika data tidak muncul, error akan spesifik menginfokan "Opsi tidak ditemukan / Timeout".
- **[Risk] Ancestor text terlalu jauh** → **Mitigation**: Membatasi traversal naik maksimal 4 level DOM dan hanya mengambil node dengan tipe teks dominan/label.
