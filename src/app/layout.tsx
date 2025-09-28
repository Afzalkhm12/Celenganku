import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import { auth } from '../auth';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Celengan.ku',
  description: 'Aplikasi Pelacak Keuangan Pribadi',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pathname = (await headers()).get('x-next-pathname') || '';

  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  const showSidebar = !!session && !isPublicPage;

  return (
    <html lang="id">
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex h-screen bg-gray-50">
          {showSidebar && (
            <div className="hidden md:flex">
              <Sidebar />
            </div>
          )}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}