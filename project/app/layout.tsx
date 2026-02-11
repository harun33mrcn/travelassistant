import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import ThemeInitializer from '@/components/theme-initializer';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TravelMind AI – Yapay zekâ destekli seyahat asistanı',
  description: 'Bütçene, tarihine ve ilgi alanlarına göre kişiselleştirilmiş seyahat planları.',
  openGraph: {
    title: 'TravelMind AI – Yapay zekâ destekli seyahat asistanı',
    description: 'Bütçene, tarihine ve ilgi alanlarına göre kişiselleştirilmiş seyahat planları.',
    url: 'https://travelmind.ai',
    siteName: 'TravelMind AI',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelMind AI – Yapay zekâ destekli seyahat asistanı',
    description: 'Bütçene, tarihine ve ilgi alanlarına göre kişiselleştirilmiş seyahat planları.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors`}>
        <ThemeInitializer />
        <Toaster position="top-right" richColors />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
