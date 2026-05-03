import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Расклад Таро",
  description: "Онлайн гадание на картах Таро с персональным толкованием от ИИ. Расклад на 1 или 3 карты — прошлое, настоящее и будущее.",
  openGraph: {
    title: "Расклад Таро | Taro Insight",
    description: "Онлайн гадание на картах Таро с персональным толкованием от ИИ.",
  },
};

export default function SpreadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
