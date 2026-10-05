# Proposal

## Why

Saat ini, jika terdapat lebih dari satu form di dalam halaman yang sama (origin dan pathname yang sama), ekstensi gagal melakukan autofill dengan benar. Masalah ini kemungkinan disebabkan karena field dari kedua form disimpan dalam satu list tanpa pemisah konteks form asalnya, yang menyebabkan `scoreResolver` mengalami kebingungan (*ambiguous*) ketika menemukan elemen input dengan nama/label yang identik di lebih dari satu tempat. Perubahan ini penting untuk mendukung aplikasi kompleks yang me-render banyak form sekaligus (seperti form pengajuan, modal dialog tambahan, dll).

## What Changes

- Modifikasi struktur `SavedFormField` dengan menambahkan referensi scope (misalnya `formIndex` atau pencarian berdasarkan closest `form` context).
- Perbarui alur ekstraksi di `utils/savedForm.ts` (`extractFormFields`) agar mengelompokkan atau memberikan tagging identitas (seperti `formIndex`) pada masing-masing field sesuai dengan elemen induk formnya.
- Perbarui alur pencarian field (terutama `scoreResolver` dalam `fieldUtils.ts`) agar mempertimbangkan identitas/scope form sehingga resolusi elemen menjadi akurat walaupun terdapat field dengan label identik namun berada di form yang berbeda.

## Capabilities

### New Capabilities

- (Tidak ada)

### Modified Capabilities

- `extension-core/form-autofill`: Merubah definisi scope deteksi field agar menyimpan dan me-resolve field tidak hanya secara global per URL, melainkan memperhitungkan hierarki form pembungkusnya.

## Impact

- **`SavedFormField` Interface**: Akan mengalami penambahan properti baru (`formIndex` atau scope indicator). Data lama mungkin tidak memiliki field ini (memerlukan *graceful degradation* fallback).
- **`utils/savedForm.ts`**: Fungsi ekstraksi akan disesuaikan untuk melacak iterasi tag `<form>`.
- **`utils/fieldUtils.ts`**: Algoritma `scoreResolver` akan dirubah untuk memastikan kecocokan dengan konteks `<form>` terdekat jika ada ambiguitas.
- **`entrypoints/fillSavedForm.content.ts`**: Akan menyesuaikan cara memanggil dan meresolusi elemen per scope.
