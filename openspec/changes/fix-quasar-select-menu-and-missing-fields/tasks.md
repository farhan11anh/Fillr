# Tasks

## 1. Implementasi Main World Helper

- [x] 1.1 Buat script `vueHelper.ts` (atau sejenisnya) yang akan berjalan di *Main World* untuk mengambil instance Vue dari elemen dan membaca/memodifikasi `modelValue`. Verifikasi dengan unit test atau console log manual di playground.
- [x] 1.2 Konfigurasi `wxt.config.ts` dan/atau injektor content script utama untuk mengeksekusi helper ini di `world: "MAIN"`. Verifikasi dengan melihat script berhasil dieksekusi di context window utama.
- [x] 1.3 Bangun protokol `window.postMessage` (req/res asinkron dengan Promise dan messageId) antara ISOLATED content script dan MAIN helper. Verifikasi dengan mengirim payload test dan menerima balasannya.

## 2. Penyimpanan State Vue Internal

- [x] 2.1 Perbarui logika fungsi `extractForm` (simpan form) agar mencoba mengirim pesan RPC ke helper untuk mengambil `instance.props.modelValue` dari `.q-field`.
- [x] 2.2 Simpan nilai `modelValue` yang terambil (jika valid string/number/boolean) berdampingan dengan `value` label DOM pada schema storage. Verifikasi melalui console log / chrome storage inspector bahwa properti baru tersimpan.

## 3. Eksekusi Pengisian via Vue Setter

- [x] 3.1 Perbarui fungsi pengisian (`fillSavedForm` / adapter terkait) untuk mendahulukan jalur `vue-instance` dengan mengirim pesan setter RPC berisi nilai tersimpan ke helper saat pengisian.
- [x] 3.2 Di dalam helper, tambahkan logika untuk menunggu hingga nilai setter tersedia dalam opsi instance (jika asinkron), memanggil `instance.props['onUpdate:modelValue'](val)`, dan mengembalikan respons keberhasilan/kegagalan. Verifikasi helper mampu mengubah state Vue pada dev playground.
- [x] 3.3 Terapkan fallback ke simulasi `click-label` (metode sebelumnya) jika helper gagal atau jika timeout/instance tidak tersedia. Verifikasi fallback berjalan mulus di production build playground.

## 4. Diagnostic Logging & Integrasi

- [x] 4.1 Tambahkan pelaporan diagnostic string log ke UI / console yang menjelaskan jalur mana yang diambil tiap field (e.g., `"vue-instance"` atau `"click-label"`). Verifikasi log tampil sesuai di popup extension.
- [x] 4.2 Tambahkan `q-select` dengan `emit-value` + `map-options` pada halaman playground untuk menguji skenario dev build dan production build. Verifikasi seluruh proses "Simpan Form" dan "Isi Form" berfungsi dengan benar.
