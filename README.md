# Linklink 🔗

Linklink adalah sebuah aplikasi *landing page* interaktif berbasis React yang dirancang secara khusus untuk membantu mengumpulkan berbagai tautan (link) ke beragam aplikasi dan platform ke dalam satu *dashboard* terpadu. 

Aplikasi ini lahir dari studi kasus untuk membantu dosen atau tenaga pendidik (terutama usia 40-50 tahun) yang kesulitan mengelola banyak akun dan sistem informasi kemahasiswaan yang tersebar. 

## ✨ Fitur Utama

- **Sistem Login Simpel (Username + PIN)**: Tidak perlu mengingat password yang rumit. Cukup gunakan **Username** dan **PIN 6-digit** bergaya ATM. Sistem tetap aman menggunakan keamanan otentikasi standar industri di balik layar.
- **Desain UI/UX Ramah Usia**: Tipografi yang besar, kontras yang jelas, serta navigasi satu halaman (monolitik) ala *Facebook* untuk menghindari kebingungan.
- **Tampilan *Bubble Link***: Tautan ditampilkan sebagai tombol kapsul besar (*bubble button*) dengan dukungan pilihan ikon (pekerjaan, edukasi, dokumen, dll) agar mudah dikenali.
- **Catatan Akun Tersembunyi (Intip Catatan)**: Lupa username untuk web akademik tertentu? Sistem menyediakan fitur laci (*accordion*) di bawah setiap tautan untuk menyimpan catatan rahasia secara spesifik untuk web tersebut.
- **Keamanan Data**: Data pengguna dan tautan tidak hanya disimpan di *browser*, melainkan secara persisten dan aman menggunakan layanan **Supabase**.

## 🛠 Teknologi yang Digunakan

Aplikasi ini tidak memiliki *backend* kustom, melainkan menggunakan pola *Serverless* / *Backend-as-a-Service*:
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [NextUI / HeroUI](https://heroui.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
- **Ikon**: [Lucide React](https://lucide.dev/)

---

## 🚀 Panduan Setup & Menjalankan Lokal

Jika Anda ingin mencoba menjalankan atau memodifikasi aplikasi ini di komputer Anda, ikuti langkah-langkah berikut:

### 1. Prasyarat
- Node.js versi 16+ terinstal.
- Akun [Supabase](https://supabase.com) (gratis).

### 2. Kloning Repositori
```bash
git clone https://github.com/<username-anda>/linklink.git
cd linklink
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Supabase
1. Buat *project* baru di Supabase.
2. Masuk ke menu **Authentication > Providers > Email**, lalu **Matikan (Uncheck) fitur "Confirm email"** karena aplikasi ini menggunakan format email *dummy* secara otomatis berdasarkan username.
3. Masuk ke menu **SQL Editor**, buat *New Query*, lalu jalankan *script* berikut untuk membuat tabel dan mengatur keamanannya:

```sql
CREATE TABLE links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  title text not null,
  url text not null,
  notes text,
  icon text default 'web',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Aktifkan keamanan RLS (Row Level Security) agar user hanya bisa melihat link-nya sendiri
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can view their own links" ON links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert their own links" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update their own links" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete their own links" ON links FOR DELETE USING (auth.uid() = user_id);
```

### 5. Setup *Environment Variables*
Buat file `.env` di direktori utama (root) *project* ini, lalu isi dengan URL dan kunci anonim dari project Supabase Anda (bisa didapat di Settings > API):
```env
VITE_SUPABASE_URL=https://<id-project-anda>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 6. Jalankan Server
```bash
npm run dev
```
Aplikasi kini berjalan di `http://localhost:5173`.

---

## ☁️ Panduan Deployment (Vercel)
Aplikasi ini sangat cocok di-deploy ke Vercel:
1. *Push* kode Anda ke GitHub.
2. Impor repositori tersebut di [Vercel](https://vercel.com).
3. Pada bagian **Environment Variables** di Vercel, jangan lupa untuk menambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
4. Klik **Deploy**!

---
*Dibuat dengan semangat mempermudah teknologi bagi semua generasi.*