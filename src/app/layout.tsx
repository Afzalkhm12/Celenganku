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
  
  // Get pathname from headers set by middleware
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || '';

  // Define public pages that should not show sidebar
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  // Show sidebar only if user is authenticated and not on public pages
  const showSidebar = !!session && !isPublicPage;

  return (
    <html lang="id">
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        {showSidebar ? (
          // Layout with sidebar for authenticated users
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {/* Mobile padding to account for mobile menu button */}
              <div className="p-4 md:p-6 pt-16 md:pt-6">
                {children}
              </div>
            </main>
          </div>
        ) : (
          // Full-width layout for public pages
          <main className="min-h-screen bg-white">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}