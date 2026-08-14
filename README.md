# UNSIA Digital Library - UAS Web Programming II

Selamat datang di repositori proyek akhir saya! Saya **Ferdian**, dan ini adalah proyek untuk memenuhi tugas UAS mata kuliah **Web Programming II**.

## Deskripsi Proyek
UNSIA Digital Library adalah sebuah aplikasi sistem manajemen perpustakaan yang dibangun untuk mendigitalisasi proses administrasi perpustakaan. Aplikasi ini memungkinkan admin untuk mengelola database buku, mencatat data anggota, serta memantau status peminjaman buku secara *real-time*.

## Fitur Utama
- **Dashboard Interaktif**: Menampilkan ringkasan statistik (Total Buku, Total Anggota, Total Peminjaman, dan Buku yang Sedang Dipinjam) dilengkapi dengan grafik visual.
- **Manajemen Buku (CRUD)**: Admin dapat menambah, mengedit, dan menghapus data buku koleksi perpustakaan.
- **Manajemen Anggota**: Pengelolaan data anggota perpustakaan yang terintegrasi.
- **Transaksi Peminjaman**: Sistem pencatatan peminjaman buku dan fitur update status pengembalian.
- **Laporan PDF**: Fitur unduh ringkasan data perpustakaan dalam bentuk PDF.

## Tampilan Aplikasi

### Halaman Login
<img width="1122" height="598" alt="image" src="https://github.com/user-attachments/assets/1cd687b8-bfac-451c-b08a-0c8c6cf0b142" />


### Dashboard Overview
<img width="1127" height="598" alt="image" src="https://github.com/user-attachments/assets/bf493786-39c9-442c-9420-60bbc1d223b0" />


## Cara Mengakses Aplikasi
Anda dapat mengakses versi *live* dari aplikasi ini melalui tautan berikut:
👉 [Klik di sini untuk mengunjungi UNSIA Digital Library](https://pemrograman-web-2-gamma.vercel.app/)

## Cara Menjalankan Lokal (Untuk Pengembangan)
Jika Anda ingin menjalankan aplikasi ini di komputer lokal, ikuti langkah berikut:

1. **Clone repositori ini:**
   ```bash
   git clone [URL_REPOSITORI_ANDA]
   
**Install dependensi (Backend & Frontend):**
Masuk ke folder backend dan frontend, lalu jalankan:
npm install
**Konfigurasi Environment:**
Pastikan file .env sudah diatur sesuai dengan koneksi database MongoDB Anda.
npm run dev
