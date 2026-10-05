# Proposal

## Why

Tampilan saat ini (terutama pada *dark mode*) memiliki beberapa elemen yang saling menimpa dan warna teks yang bertabrakan dengan background, sehingga tidak terbaca dengan baik. UI/UX perlu dirapikan untuk memastikan pengalaman pengguna konsisten, kontras teks memenuhi standar aksesibilitas WCAG AA (teks 4.5:1, komponen 3:1), serta elemen yang disisipkan ke halaman web terisolasi dari gaya bawaan halaman.

## What Changes

- Refactor dan inventarisasi seluruh komponen tampilan (popup, switcher, options, dsb).
- Mengganti semua warna *hard-coded* dengan design tokens semantik (CSS variables) yang mendukung varian terang dan gelap mengikuti `prefers-color-scheme`.
- Menyesuaikan kontras (WCAG AA), memperbaiki teks yang terpotong menggunakan teknik pemotongan yang aman (ellipsis + tooltip), dan memperbaiki layout komponen (z-index, absolute positioning).
- Merapikan konsistensi *spacing*, radius sudut, tipografi, serta interaksi state (hover, focus, disabled, loading).
- Membungkus seluruh injeksi elemen UI pada dokumen halaman web menggunakan `Shadow DOM` agar terbebas dari kebocoran style CSS _host page_.

## Capabilities

### New Capabilities
- `extension-core/theme-and-polish`: Standardisasi tema warna terang/gelap dan spesifikasi tata letak untuk seluruh komponen UI, serta penerapan gaya terisolasi pada injeksi DOM.

### Modified Capabilities
- (Tidak ada perubahan pada perilaku inti aplikasi)

## Impact

- Membutuhkan perombakan CSS eksisting di dalam file `index.css` atau blok `<style>` di seluruh komponen Vue.
- Akan menggunakan CSS Variables secara universal tanpa mengubah logika fungsi form atau local storage.
- Melibatkan modifikasi utilitas _content script_ yang memproduksi elemen UI (misal: JSON Viewer, highlighter).
