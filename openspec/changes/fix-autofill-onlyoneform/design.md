# Design

## Context

Fitur autofill saat ini memproses halaman web secara *flat* dengan mengambil semua field di bawah `document`. Jika terdapat lebih dari satu elemen `<form>` yang mempunyai struktur form identik (misalnya label field yang sama), hal ini menyebabkan tabrakan data (ambiguous field) karena struktur lama `SavedFormField` tidak menyimpan konteks form mana field tersebut berasal. Lihat `proposal.md` untuk motivasi perubahan ini.

## Goals / Non-Goals

**Goals:**
- Mendukung ekstraksi field yang akurat saat terdapat multiple form di halaman web (origin dan pathname yang sama).
- Mampu membedakan dua input ber-label sama asalkan berada di `<form>` yang berbeda.
- Menjaga *backward compatibility* dengan data form tersimpan yang menggunakan format lama (tanpa `formIndex`).

**Non-Goals:**
- Meng-autofill field yang termuat dalam iframe lintas-domain (cross-origin iframe tetap tidak didukung).
- Memecah data `SavedFormField` ke dalam store object yang berbeda-beda; list tetap flat per URL namun fieldnya mendapat penanda indeks form.

## Decisions

**Decision 1: Menggunakan `formIndex` sebagai penanda hierarki**
Setiap field di `SavedFormField` akan ditambahi properti opsional `formIndex?: number`.
*Rationale*: Urutan elemen `<form>` pada halaman (berdasarkan `document.querySelectorAll('form')`) umumnya konsisten tiap kali komponen dirender. Pendekatan indeks cukup andal dan ringan tanpa perlu menambahkan custom attribute `data-fillr-id` secara presisten. Elemen yang tidak berada di dalam `<form>` akan diberi `formIndex: -1` (global scope).

**Decision 2: Modifikasi `extractFormFields`**
Saat mengekstrak, kita ambil dulu daftar forms: `const forms = Array.from(document.querySelectorAll('form'))`. Lalu saat memproses tiap `element` (field root), kita cek posisi induk formnya menggunakan `element.closest('form')` dan temukan indeksnya di array `forms`.

**Decision 3: Filter kandidat resolver pada `fillSavedForm`**
Di dalam proses *fill*, kita ambil list forms di halaman, kemudian lakukan pre-filter kandidat DOM `fieldRoots` agar hanya menyisakan elemen yang memiliki `formIndex` yang sama dengan data yang hendak diisi. Jika properti `formIndex` pada data lama tidak ada (`undefined`), sistem fallback ke pencarian global seperti sebelumnya untuk *backward compatibility*.

## Risks / Trade-offs

- **[Risk]** Urutan elemen `<form>` bisa bergeser apabila halaman memuat form lain secara asinkron di atasnya (misal form login di navbar vs form konten).
  - **Mitigation**: Kasus ini jarang untuk form yang identik. Penggunaan indeks masih merupakan *best-effort* yang termudah. Dalam iterasi berikutnya bisa dipertimbangkan menggunakan kombinasi `form.id` atau `form.name` jika indeks terlalu rentan *flaky*.
- **[Risk]** Data form lama di storage tidak memiliki `formIndex`.
  - **Mitigation**: `formIndex` dibuat opsional. Logika pengisian otomatis (resolver) mem-bypass verifikasi scope form jika `formIndex` tidak terdefinisi (berlaku seperti versi saat ini).

## Migration Plan

Tidak ada migrasi struktur database yang kompleks (hanya menambah property opsional). Update dapat dirilis langsung karena telah ditangani dengan mekanisme backward compatibility (undefined check).

## Open Questions

(Tidak ada)
