# Design

## Context

Komponen `q-select` Quasar pada mode `emit-value` + `map-options` menyimpan state nilai sebenarnya (mis. `institutionCode`) di dalam state internal Vue, sementara DOM hanya merender representasi string label (mis. "RS Aisyiah Bojonegoro"). Ekstensi saat ini murni beroperasi di *Isolated World*, di mana `el.__vueParentComponent` tidak tersedia (diblokir oleh browser security). Akibatnya, operasi simpan dan isi form kehilangan akurasi karena tidak bisa menyimpan state asli dari Vue. Namun di *Main World*, jika aplikasi di-*build* dalam mode development (atau tanpa mematikan Vue devtools), properti `__vueParentComponent` dapat diakses langsung pada elemen DOM target.

## Goals / Non-Goals

**Goals:**
- Membuat jalur komunikasi `Isolated <-> Main` via `window.postMessage`.
- Membaca dan menyimpan nilai `modelValue` yang presisi dari Vue instance.
- Mengeksekusi pengisian data asinkron langsung melalui instance Vue dengan `instance.props['onUpdate:modelValue'](modelValue)`.
- Mengimplementasikan pengamanan fallback jika Vue instance tak tersedia, tanpa *crash*.

**Non-Goals:**
- Menginjeksi atau membaca store Pinia/Vuex secara langsung (hanya scope komponen).
- Mengubah arsitektur *scoring resolver* (hanya mem-pass data tambahan).

## Decisions

1. **Injeksi Helper ke Main World**
   - **Keputusan**: Menggunakan injeksi `<script>` via `chrome.scripting.executeScript({ world: "MAIN" })` atau menambahkan bundle webpack terpisah untuk di-*inject* oleh content script utama ke `<head>`.
   - **Alasan**: *Main World* adalah satu-satunya ruang yang berbagi eksekusi context dengan objek JavaScript halaman web (termasuk properti custom DOM seperti `__vueParentComponent`).
   - **Alternatif**: Ekstensi Vue Devtools menggunakan pendekatan yang sama.

2. **Protokol Komunikasi Asinkron `window.postMessage`**
   - **Keputusan**: Menggunakan channel khusus (misal: `FILLR_VUE_RPC_REQ` dan `FILLR_VUE_RPC_RES`) dengan *origin validation* terbatas pada ekstensi dan window itu sendiri.
   - **Alasan**: Kedua world berbagi DOM window yang sama, `postMessage` aman dan asinkron.

3. **Traversing ke QSelect/QInput**
   - **Keputusan**: Helper akan menerima element (lewat custom UUID id yang di-set sesaat oleh content script) atau XPath sederhana. Helper mengambil element, mengakses `el.__vueParentComponent`, dan *traverse* `.parent` ke atas hingga `instance.type.name === 'QSelect'` atau `'QInput'`.
   - **Alasan**: Field root (`.q-field`) belum tentu elemen teratas komponen QSelect, seringkali hanya *wrapper* dalam DOM. Traversing instance parent adalah cara paling aman.

4. **Metode Verifikasi & Fallback**
   - **Keputusan**: Jalur Vue instance tidak meniadakan event DOM native. Jika `onUpdate:modelValue` dipanggil, helper merespon sukses, dan script ISOLATED tetap memverifikasi teks label akhir di DOM. Jika teks tidak sesuai, ISOLATED fallback ke metode simulasi klik native.

## Risks / Trade-offs

- **[Risk] DOM properties hilang di Production Build** → **Mitigasi**: Pastikan mekanisme *fallback* simulasi native klik (jalur DOM murni) tetap kokoh jika helper merespon `__vueParentComponent` "tidak tersedia".
- **[Risk] Tabrakan / Race Condition `postMessage`** → **Mitigasi**: Gunakan format payload RPC yang memuat `messageId` acak per permintaan, memastikan respons dipetakan dengan tepat ke janji (Promise) yang menunggu.
