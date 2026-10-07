# PRD — Halaman Detail Produk

---

## 1. Product Overview

Halaman detail produk baju membantu pengguna memahami informasi produk serta memilih warna dan jumlah barang sebelum melanjutkan pembelian.

Pada versi ini, halaman berfokus pada tampilan informasi dan interaksi pemilihan produk. **Proses transaksi belum termasuk scope.**

### Contoh Produk

| Data | Nilai |
|---|---|
| Nama | Dynamic M75B |
| Harga | Rp1.499.000 |
| Deskripsi | Noise-Cancelling Wireless Headphones |
| Warna | Hitam dan Silver |
| Stok | Warna Hitam: 1 — Silver: 0 |
| Foto | Satu foto utama untuk setiap warna |

Konten utama halaman mencakup: **header, foto produk, nama produk, harga, deskripsi, pilihan variasi, quantity, dan footer.**

---

## 2. Problem + Target User

### Problem

Pengguna membutuhkan informasi yang jelas untuk menilai apakah produk sesuai dengan kebutuhan mereka. Pilihan warna dan jumlah barang juga harus mudah dipahami agar pengguna mengetahui pilihan yang sedang aktif.

Masalah yang ingin diselesaikan:

- Informasi produk tersebar atau sulit ditemukan.
- Tidak ada informasi fitur.
- Jumlah barang bisa dipilih melebihi stok atau kurang dari satu.
- Pengguna tidak mendapatkan feedback setelah memilih produk.
- Tidak ada informasi isi box dalam pembelian.

### Target User

Target user produk **DYNAMIC M75B** adalah pria maupun wanita usia **25–55 tahun** dari kalangan menengah atas hingga atas, terutama profesional, eksekutif, entrepreneur, dan business traveler yang memiliki gaya hidup premium.

Mereka membutuhkan headphone dengan kualitas audio tinggi, noise cancellation, kenyamanan untuk perjalanan panjang, serta desain elegan yang mendukung penampilan profesional.

**Kebutuhan utama:** mendapatkan informasi yang jelas untuk memastikan produk sesuai dengan kebutuhan mereka, terutama mengenai kualitas suara, fitur ANC, kenyamanan, desain, spesifikasi, harga, ketersediaan, serta kelengkapan produk sebelum memutuskan untuk membeli.

---

## 3. Goals + Non-Goals

### Goals

1. Menampilkan informasi produk dengan jelas dan mudah dibaca.
2. Memungkinkan pengguna memilih satu warna.
3. Memungkinkan pengguna mengubah jumlah barang sesuai batas stok.
4. Menampilkan fitur yang ditawarkan oleh produk tersebut.
5. Memberikan tombol **Add to Cart** sebagai tombol aksi utama.
6. Memberikan pengalaman yang nyaman pada desktop dan mobile.

### Non-Goals

Versi ini tidak mencakup:

- Login dan registrasi.
- Pengambilan data melalui API.
- Keranjang belanja yang tersimpan.
- Checkout dan pembayaran.
- Perhitungan ongkos kirim.
- Review, rating, wishlist, atau rekomendasi produk.
- Pengelolaan produk melalui halaman admin.

---

## 4. User Flow

1. User membuka halaman produk **DYNAMIC M75B**.
2. User melihat product berupa gambar, nama produk, harga, dan tombol pembelian.
3. User melihat galeri gambar produk.
4. User membaca deskripsi dan keunggulan produk.
5. User melihat fitur dan spesifikasi produk.
6. User memilih varian/warna yang tersedia.
7. User melihat harga dan ketersediaan stok.
8. User menekan tombol **Add to Cart**.
9. User membuka Shopping Cart.
10. User memeriksa produk, varian, jumlah, dan total harga.
11. User menekan **Checkout**.
12. User mengisi informasi pembeli dan pengiriman.
13. User memilih metode pembayaran.
14. User melihat ringkasan pesanan.
15. User menekan **Place Order / Confirm Order**.
16. User melihat halaman konfirmasi pesanan.

---

## 5. Features + Requirements

### Features

| # | Fitur | Deskripsi |
|---|---|---|
| 1 | Product Image Gallery | Menampilkan beberapa foto produk dan navigasi previous/next. |
| 2 | Product Information | Menampilkan nama produk, kategori, harga, dan status ketersediaan. |
| 3 | Product Variant Selection | User dapat memilih warna Black atau Silver. |
| 4 | Add to Cart | Tombol untuk menambahkan produk ke keranjang. |
| 5 | Product Highlights | Menampilkan fitur utama: ANC, 40mm Beryllium Drivers, baterai hingga 32 jam, Bluetooth 5.1, dan 4 microphone. |
| 6 | Product Description | Menjelaskan positioning, material, desain, dan fungsi produk. |
| 7 | Technical Specifications | Menampilkan material, dimensi, berat, driver, konektivitas, baterai, dan spesifikasi lainnya. |
| 8 | What's in the Box | Menampilkan seluruh aksesori yang diperoleh dalam pembelian. |
| 9 | Shipping & Returns Information | Menampilkan informasi pengiriman dan kebijakan retur. |
| 10 | Product Support | Link menuju support center dan FAQ. |
| 11 | Shopping Cart | Menampilkan jumlah produk dan isi keranjang. |
| 12 | Search & Navigation | Fitur pencarian serta navigasi kategori produk. |
| 13 | Country/Currency Selection | User dapat memilih negara dan mata uang yang tersedia. |

### Front-End Requirements

1. Website harus **responsive** untuk desktop, tablet, dan mobile.
2. Gallery harus dapat digunakan melalui thumbnail dan tombol Previous/Next.
3. Pemilihan warna harus memberikan **visual feedback** pada varian yang aktif.
4. Tombol Add to Cart harus berubah sesuai status produk (misal: *Sold Out* atau *Pre-Order*).
5. Harga harus ditampilkan dengan **format mata uang** sesuai negara yang dipilih.
6. Informasi produk harus disusun dalam section yang mudah dipindai.
7. Spesifikasi teknis harus memiliki struktur yang jelas dan mudah dibaca.
8. Cart harus memperbarui jumlah item secara **real-time** setelah produk ditambahkan.
9. Navigasi, search, dan tombol interaktif harus memiliki **hover, active, dan focus state**.
10. Semua gambar produk harus memiliki **alt text** untuk accessibility.
11. Website harus memiliki **loading state** dan **error state** untuk elemen yang membutuhkan data.
12. Layout harus mempertahankan visual **premium/minimalist** sesuai karakter produk dan brand.

---

## 6. User Stories

| # | User Story |
|---|---|
| User 1 | Melihat gambar dan desain produk. |
| User 2 | Melihat harga dan ketersediaan produk. |
| User 3 | Memilih varian warna produk. |
| User 4 | Melihat fitur dan spesifikasi produk. |
| User 5 | Menambahkan produk ke keranjang dan melakukan checkout. |
| User 6 | Melihat ringkasan pesanan dan menyelesaikan pembelian. |

---

## 7. Acceptance Criteria

| ID | Kriteria |
|---|---|
| AC 1 | User dapat melihat gambar, nama, harga, dan informasi utama produk dengan jelas. |
| AC 2 | User dapat memilih varian warna dan sistem menampilkan varian yang dipilih. |
| AC 3 | User dapat melihat fitur dan spesifikasi produk. |
| AC 4 | User dapat melihat status ketersediaan atau stok produk. |
| AC 5 | User dapat menambahkan produk ke shopping cart. |
| AC 6 | User dapat melihat ringkasan pesanan dan total harga sebelum checkout. |

---

## 8. Constraints + Success Criteria

### Constraints

| ID | Constraint |
|---|---|
| C1 | Website harus responsive pada desktop, tablet, dan mobile. |
| C2 | Tampilan harus mengikuti identitas visual premium dan minimalis. |
| C3 | Informasi produk harus mudah dibaca dan tidak terlalu padat. |
| C4 | Fitur hanya mencakup kebutuhan front-end dan tidak membahas proses backend. |
| C5 | Website harus memiliki navigasi dan interaksi yang mudah digunakan. |

### Success Criteria

| ID | Kriteria Keberhasilan |
|---|---|
| SC1 | User dapat menemukan informasi utama produk dengan mudah. |
| SC2 | User dapat memilih varian dan melihat perubahan produk dengan benar. |
| SC3 | User dapat memahami fitur, spesifikasi, harga, dan ketersediaan produk. |
| SC4 | User dapat menambahkan produk ke cart tanpa mengalami kebingungan. |
| SC5 | User dapat menyelesaikan flow dari halaman produk hingga checkout dengan lancar. |
| SC6 | Website memberikan pengalaman yang konsisten dan nyaman di berbagai ukuran layar. |
