import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'MOVIA - Encuentra tu próximo vehículo',
  description: 'Concesionario multimarca ficticio. Autos, SUV y camionetas nuevos y usados en pesos colombianos. Consulta sin registro.',
  keywords: ['concesionario', 'autos', 'SUV', 'camionetas', 'vehículos', 'Colombia', 'COP'],
  authors: [{ name: 'MOVIA' }],
  openGraph: {
    title: 'MOVIA - Encuentra tu próximo vehículo',
    description: 'Concesionario multimarca ficticio. Autos, SUV y camionetas nuevos y usados.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#101418',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-dm-sans antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Providers>
            {children}
          </Providers>
        </main>
        <Footer />
      </body>
    </html>
  );
}