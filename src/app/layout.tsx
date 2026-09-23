import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProductLocalStoreProvider } from '@/context/ProductLocalStore';

export const metadata: Metadata = {
  title: 'Product Admin Dashboard | Next.js & Axios',
  description:
    'A high-performance Product Admin Dashboard built with Next.js App Router, React, Axios, and Tailwind CSS using DummyJSON API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          <ProductLocalStoreProvider>{children}</ProductLocalStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
