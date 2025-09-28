# Celengan.ku | Your Modern Financial Co-pilot
<p align="center">
  <strong>Membangun masa depan finansial yang cerah, dimulai dari kebiasaan kecil hari ini.</strong>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">
</p>

**Celengan.ku** bukan sekadar aplikasi pencatat keuangan biasa. Ini adalah ekosistem digital yang dirancang untuk memberdayakan generasi muda Indonesia agar lebih sadar finansial. Kami mengubah tugas yang membosankan menjadi perjalanan yang memotivasi, membantu pengguna memahami ke mana uang mereka pergi dan memberanikan mereka untuk mencapai impian finansial, sekecil apa pun itu.

## 🚀 Live Demo

Rasakan pengalaman mengelola keuangan yang intuitif dan modern.
**Kunjungi Live Demo: https://celenganku-omega.vercel.app/**

---

## ✨ Mengapa "Celengan.ku"? Fitur Unggulan Kami

Kami fokus pada pengalaman pengguna yang tidak hanya fungsional, tetapi juga mencerahkan dan memotivasi.

#### **Core Functionality**
* **🏦 Multi-Rekening Terpusat:** Pantau semua sumber dana Anda—dari rekening bank, e-wallet, hingga uang tunai—dalam satu dasbor yang bersih.
* **✍️ Pencatatan Super Cepat:** Tambah, edit, atau hapus transaksi dalam hitungan detik dengan antarmuka yang intuitif.
* **🎯 Anggaran Cerdas:** Atur batas pengeluaran untuk setiap kategori dan dapatkan visualisasi *progress bar* agar Anda tetap di jalur yang benar.
* **🔄 Otomatisasi Rutinitas:** Jadwalkan transaksi berulang seperti gaji atau tagihan, dan biarkan sistem bekerja untuk Anda.

#### **Smart & Insightful Features**
* **🏦 "Digital Celengan":** Wujudkan impian Anda! Buat target tabungan visual, pantau perkembangannya, dan rayakan setiap pencapaian.
* **💡 *Insight* Finansial Proaktif:** Dapatkan ringkasan cerdas yang di-generate sistem mengenai kesehatan finansial Anda, seperti peringatan pengeluaran berlebih di satu kategori.
* **📈 Visualisasi yang Bercerita:** Pahami kebiasaan finansial Anda melalui grafik dan diagram yang mudah dibaca, bukan hanya angka-angka yang membosankan.

---

## 🛠️ Arsitektur & Teknologi Pilihan

Setiap teknologi dalam proyek ini dipilih secara cermat untuk menciptakan aplikasi yang modern, berperforma tinggi, dan dapat diandalkan.

| Komponen | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Dipilih untuk **performa** (SSR & RSC) yang memberikan waktu muat halaman awal yang sangat cepat dan **pengalaman developer** yang terintegrasi (API Routes), memungkinkan pengembangan full-stack dalam satu repositori. |
| **Styling** | **Tailwind CSS** | Pendekatan *utility-first* memungkinkan **pembuatan UI yang cepat dan konsisten** tanpa meninggalkan HTML. Desain yang responsif dapat dicapai dengan mudah, memastikan pengalaman yang mulus di semua perangkat. |
| **Database** | **PostgreSQL (Neon)** | PostgreSQL dikenal **andal dan tangguh** untuk integritas data. Neon sebagai host menawarkan arsitektur **serverless** yang hemat biaya, terukur secara otomatis, dan mudah dikelola. |
| **ORM** | **Prisma** | Menjadi jembatan antara aplikasi dan database, Prisma dipilih karena **keamanan tipe (type-safety)** yang luar biasa, mengurangi bug, dan fitur *auto-completion* yang drastis **mempercepat proses development**. |
| **Autentikasi** | **NextAuth.js** | Menyediakan solusi **keamanan yang solid dan mudah diimplementasikan** untuk menangani proses autentikasi yang kompleks, dari login kredensial hingga manajemen sesi berbasis JWT. |
| **Visualisasi** | **Recharts** | Pustaka grafik berbasis React yang dipilih karena **kemudahan penggunaan** dan kemampuannya untuk membuat **diagram yang indah dan interaktif** dengan sedikit konfigurasi. |

---

## 🤖 Memanfaatkan AI sebagai Co-Pilot Pengembangan (IBM Granite)

Sesuai tujuan proyek, AI **tidak diintegrasikan sebagai fitur live**, melainkan diadopsi sebagai **co-pilot strategis** selama proses pengembangan. IBM Granite berperan penting dalam meningkatkan efisiensi, kualitas, dan inovasi.

1.  **Arsitektur & Desain Awal**
    * **Tantangan:** Merancang skema database yang ternormalisasi untuk 8 tabel yang kompleks.
    * **Peran AI:** IBM Granite digunakan untuk men-generate draf awal skema SQL dan skema Prisma. Dengan memberikan *prompt* yang berisi entitas dan relasi, AI mampu menghasilkan struktur dasar yang solid, lengkap dengan tipe data yang sesuai dan kendala relasional.
    * **Dampak:** **Mempercepat fase desain arsitektur hingga 50%** dan memastikan fondasi data yang kuat.

2.  **Logika Backend & Algoritma**
    * **Tantangan:** Mengimplementasikan logika "Insight Finansial Cerdas" berbasis aturan dan *cron job* harian untuk transaksi berulang.
    * **Peran AI:** AI membantu menerjemahkan aturan bisnis ("jika rasio tabungan > 20%...") menjadi kode JavaScript yang efisien. Untuk *cron job*, AI memberikan kerangka *serverless function* dan *query* Prisma yang optimal untuk dijalankan setiap hari.
    * **Dampak:** Mengatasi tantangan algoritmik yang kompleks dengan lebih cepat dan mempelajari implementasi *best practice* (seperti `Prisma.$transaction`).

3.  **Akselerasi Pengembangan Frontend**
    * **Tantangan:** Membuat puluhan komponen UI dari awal.
    * **Peran AI:** AI digunakan sebagai "generator komponen". Dengan *prompt* deskriptif seperti "buatkan saya komponen Card dengan varian 'warning' menggunakan Tailwind CSS", AI menghasilkan *boilerplate* HTML dan CSS yang fungsional.
    * **Dampak:** **Mengurangi waktu penulisan kode berulang hingga 40%**, memungkinkan fokus lebih pada aspek fungsionalitas dan pengalaman pengguna.

Secara keseluruhan, IBM Granite bukan hanya penulis kode, tetapi juga mitra *sparring* untuk ide, *debugger*, dan akselerator yang memungkinkan proyek ini diselesaikan dengan standar yang lebih tinggi dalam waktu yang lebih singkat.

---

## 🚀 Memulai Secara Lokal

Tertarik untuk mencoba atau berkontribusi? Ikuti langkah-langkah mudah ini untuk menjalankan proyek secara lokal.

1.  **Prasyarat**
    * Node.js v18+
    * pnpm (direkomendasikan)

2.  **Instalasi**
    ```bash
    # 1. Clone repositori
    git clone [https://github.com/](https://github.com/)[NAMA_USER_ANDA]/[NAMA_REPO_ANDA].git
    cd celenganku-app

    # 2. Install dependensi
    pnpm install

    # 3. Setup environment variables
    # Salin dari .env.example dan isi nilainya
    cp .env.example .env

    # 4. Sinkronisasi skema database
    pnpm prisma db push

    # 5. Jalankan aplikasi
    pnpm dev
    ```

3.  **Buka Aplikasi**
    Aplikasi Anda siap diakses di [http://localhost:3000](http://localhost:3000).

---

Terima kasih telah mengunjungi repositori **Celengan.ku**. Mari kita buat literasi finansial menjadi lebih mudah diakses untuk semua!