# extension-core/theme-and-polish

## Purpose

Menetapkan pedoman UI/UX, tata letak, dan standar aksesibilitas berbasis tema (Terang & Gelap) menggunakan variabel CSS semantik yang diisolasi dengan Shadow DOM untuk elemen injeksi halaman.

## Requirements

### Requirement: Standar Aksesibilitas Kontras WCAG AA
Sistem MUST menggunakan warna yang mematuhi pedoman rasio kontras WCAG AA (minimal 4.5:1 untuk teks normal dan 3:1 untuk elemen/komponen grafis) di setiap mode warna (terang maupun gelap).

#### Scenario: Keterbacaan teks mode gelap
- **WHEN** pengguna merubah OS ke mode gelap
- **THEN** popup ekstensi menampilkan background gelap (`--bg`) dengan warna teks yang cukup terang (`--text`), terukur memenuhi rasio 4.5:1, tanpa ada teks *hardcoded* berwarna hitam yang tidak terbaca

### Requirement: Tampilan Terisolasi Menggunakan Shadow DOM
Sistem MUST membungkus (isolate) seluruh elemen UI yang disisipkan ke halaman web pengguna (seperti JSON Viewer, highlight form, dan toast notification) ke dalam `Shadow DOM`.

#### Scenario: Injeksi elemen ke halaman dengan global styling konflik
- **WHEN** pengguna menggunakan fitur JSON Viewer pada halaman yang memiliki konfigurasi CSS global ekstrim (contoh: `div { display: none !important; }`)
- **THEN** komponen Viewer tetap muncul dan merender tata letaknya secara sempurna karena style-nya dibungkus aman di dalam Shadow Root

### Requirement: Komposisi Teks Panjang & Layout
Sistem SHALL menangani rentang teks berlebih (URL panjang, ID field panjang, JSON keys) dengan batas overflow yang rapi, memastikan teks terpotong oleh `text-overflow: ellipsis` dan bisa dibaca lewat `title` (tooltip) atau scroll area. Tidak ada elemen `absolute` yang keluar kontainer atau menutupi panel di bawahnya.

#### Scenario: Menampilkan value localStorage yang panjang di popup
- **WHEN** user membuka panel LocalStorage Transfer dan path/URL yang terdeteksi melampaui lebar panel
- **THEN** teks URL dipotong rapi dengan ellipsis (...), ukuran popup tidak membesar secara eksesif (overflow), dan user dapat melihat URL utuh jika mengarahkan mouse (hover tooltip)
