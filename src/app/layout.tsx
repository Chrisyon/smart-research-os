import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ainya — Smart Research OS",
  description: "Asisten Riset AI Cerdas dan Grounded Retrieval Engine berbasis dokumen Anda",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ainya",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] h-[100dvh] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
