import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Bebas_Neue } from 'next/font/google';
import ClientLayout from "./client-layout";

const bebasNeue = Bebas_Neue({
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas-neue',
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "VoyageVista",
  description: "A platform for seamless travel planning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server Component - can't use hooks directly
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="font-[Inter]" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
