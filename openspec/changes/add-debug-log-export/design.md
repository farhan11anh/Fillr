# Design

## Context

Lihat `proposal.md` untuk motivasi perubahan ini.
Ekstensi Fillkit terdiri atas berbagai context (Content Scripts, Popup, Main World Script). Proses autofill dilakukan dalam content script utama. Pencatatan log selama proses pengisian harus terjadi di mana aksi dilakukan (Content Script) dan dapat diakses dari popup untuk disalin ke clipboard.

## Goals / Non-Goals

**Goals:**
- Membuat modul internal logger yang efisien secara memori (O(1) insertion, fixed space).
- Mengintegrasikan mekanisme pelaporan yang anonim tanpa membahayakan data privasi user.
- Mengalirkan log dari content script ke popup via Chrome Messaging (RPC/Message Passing).

**Non-Goals:**
- Tidak mengirim atau melakukan agregasi log ke server eksternal (analytics).
- Tidak menyimpan log secara permanen melewati batas siklus navigasi halaman.

## Decisions

1. **Storage Log Menggunakan Array Memory di Content Script (Ring Buffer)**
   - **Rationale**: Kita menargetkan 500 baris log untuk menghindari *memory leak* pada halaman single-page application (SPA) yang jarang di-reload. Log ini bersifat temporary dan hanya ditujukan untuk sesi interaksi form di halaman aktif tersebut.
   - **Alternative Considered**: Menggunakan `chrome.storage.session` atau `sessionStorage`. Namun `chrome.storage.session` memerlukan proses serialisasi/deserialisasi asinkron dan ukurannya dibatasi. `sessionStorage` tidak bisa diakses dari background/popup secara langsung tanpa melewati content script.

2. **Penyamaran Data (Redaction) pada Tipe String**
   - **Rationale**: Form bisa berisikan PII (Personally Identifiable Information). Logger memetakan input tipe data string (kecuali dropdown label yang statis) menjadi `[String length N]` untuk melindungi privasi.
   - **Alternative Considered**: Hashing value (MD5/SHA). Tidak perlu dan *overkill* karena kita hanya ingin tahu apakah nilainya diisi atau tidak (panjang string cukup membuktikannya).

3. **Mekanisme Tarik Log dari Popup (Pull Mechanism)**
   - **Rationale**: Daripada content script secara proaktif me-push setiap log ke background, popup akan mengirim pesan "Minta Log" (`GET_DEBUG_LOGS`) ke tab aktif saat user menekan "Salin log debug".
   - **Alternative Considered**: Push via `chrome.runtime.sendMessage` tiap baris log. Bisa membuat kemacetan channel pesan jika form panjang.

4. **Toggle Mode Debug di Popup**
   - **Rationale**: Mode ini disimpan pada `chrome.storage.local` dan diambil setiap kali sesi "Isi form" atau "Simpan form" berjalan. 

## Risks / Trade-offs

- **[Risk] Log hilang karena navigasi tab**: Jika ekstensi mengisi form lalu tab berpindah halaman (*hard redirect*), log akan musnah dari memori content script sebelum sempat disalin.
  - **Mitigation**: Log dikhususkan untuk investigasi kegagalan pengisian/penemuan form. Biasanya form yang gagal diisi tidak akan men-trigger navigasi halaman.
- **[Risk] Akses message passing terputus pada tab iframe terisolasi**: Form yang berada pada `iframe` berbeda origin mungkin tidak dapat membalas pesan log ke tab root.
  - **Mitigation**: Fokus debugging saat ini diimplementasikan pada world context utama tab. Log iframe (jika ada) berada di scope luar implementasi fase ini.
