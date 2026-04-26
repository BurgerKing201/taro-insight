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

export const metadata: Metadata = {
  title: {
    default: "Taro Insight — Таро, Нумерология, Астрология онлайн",
    template: "%s | Taro Insight",
  },
  description: "Бесплатные персональные гадания на Таро онлайн. Дневной расклад карт, нумерология по дате рождения, совместимость и гороскоп от ИИ.",
  keywords: ["таро онлайн", "гадание на картах таро", "нумерология онлайн", "гороскоп", "расклад таро бесплатно", "астрология"],
  authors: [{ name: "Taro Insight" }],
  metadataBase: new URL("https://taroinsight.space"),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://taroinsight.space",
    siteName: "Taro Insight",
    title: "Taro Insight — Таро, Нумерология, Астрология онлайн",
    description: "Бесплатные персональные гадания на Таро онлайн. Дневной расклад, нумерология, совместимость и гороскоп от ИИ.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Taro Insight" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taro Insight — Таро, Нумерология, Астрология онлайн",
    description: "Бесплатные персональные гадания на Таро онлайн.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
