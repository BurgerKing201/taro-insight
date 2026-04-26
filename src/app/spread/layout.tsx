import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Расклад Таро онлайн — дневное гадание на картах",
  description: "Бесплатный расклад карт Таро онлайн. Выберите карту и получите персональное толкование от ИИ. Однокарточный и трёхкарточный расклад.",
  openGraph: {
    title: "Расклад Таро онлайн — дневное гадание на картах",
    description: "Бесплатный расклад карт Таро онлайн. Персональное толкование от ИИ.",
    url: "https://taroinsight.space/spread",
  },
};

export default function SpreadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
