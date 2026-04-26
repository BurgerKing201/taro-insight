import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Гороскоп на сегодня — персональный прогноз от ИИ",
  description: "Персональный гороскоп на сегодня для вашего знака зодиака. Точный прогноз от астрологического ИИ — бесплатно и без регистрации.",
  openGraph: {
    title: "Гороскоп на сегодня — персональный прогноз от ИИ",
    description: "Персональный гороскоп на сегодня для вашего знака зодиака.",
    url: "https://taroinsight.space/horoscope",
  },
};

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
