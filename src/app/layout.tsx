import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://taro-insight.ru";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Taro Insight — Таро, Нумерология, Астрология",
    template: "%s | Taro Insight",
  },
  description: "Персональные гадания на Таро, нумерология и гороскопы с искусственным интеллектом. Дневной расклад, совместимость и астрологический прогноз.",
  keywords: ["таро", "гадание", "нумерология", "гороскоп", "астрология", "совместимость", "расклад таро онлайн"],
  authors: [{ name: "Taro Insight" }],
  creator: "Taro Insight",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "Taro Insight",
    title: "Taro Insight — Таро, Нумерология, Астрология",
    description: "Персональные гадания на Таро, нумерология и гороскопы с искусственным интеллектом.",
    images: [{ url: "/opengraph-image.png", width: 1640, height: 2360, alt: "Taro Insight" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taro Insight — Таро, Нумерология, Астрология",
    description: "Персональные гадания на Таро, нумерология и гороскопы с искусственным интеллектом.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e8e8ed]">
        {children}
      </body>
    </html>
  );
}
