import Link from 'next/link';
import { PiggyBank, BarChart, Target, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <PiggyBank className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">Celengan.ku</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">Fitur</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">Cara Kerja</a>
            <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition">Manfaat</a>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-blue-50 pt-32 pb-20 text-center">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Kelola Keuangan Pribadi, <br className="hidden sm:block" /> Raih Tujuan Finansial Anda.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Celengan.ku adalah cara cerdas dan sederhana untuk melacak pengeluaran, membuat anggaran, dan menabung untuk masa depan impian Anda.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
                  Mulai Gratis Sekarang <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Fitur Cerdas untuk Anda</h2>
              <p className="mt-4 text-gray-600">Semua yang Anda butuhkan dalam satu aplikasi.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg text-center transform hover:scale-105 transition-transform duration-300">
                <BarChart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dasbor Intuitif</h3>
                <p className="text-gray-600">Lihat ringkasan pemasukan, pengeluaran, dan tabungan Anda dalam sekejap.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg text-center transform hover:scale-105 transition-transform duration-300">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Anggaran Fleksibel</h3>
                <p className="text-gray-600">Atur batas pengeluaran bulanan untuk setiap kategori dan pantau kemajuannya.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg text-center transform hover:scale-105 transition-transform duration-300">
                <PiggyBank className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Celengan Digital</h3>
                <p className="text-gray-600">Buat tujuan tabungan, seperti liburan atau dana darurat, dan lihat progres Anda.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-blue-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Mulai dalam 3 Langkah Mudah</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
              <div className="text-center max-w-xs">
                <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Daftar Akun</h3>
                <p className="text-gray-600">Buat akun gratis Anda dalam hitungan detik.</p>
              </div>
               <div className="text-center max-w-xs">
                <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Catat Transaksi</h3>
                <p className="text-gray-600">Mulai catat pemasukan dan pengeluaran harian Anda.</p>
              </div>
               <div className="text-center max-w-xs">
                <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Dapatkan Insight</h3>
                <p className="text-gray-600">Lihat laporan dan dapatkan tips cerdas untuk keuangan lebih baik.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Celengan.ku. Semua Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}