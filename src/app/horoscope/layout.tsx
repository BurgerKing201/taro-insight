import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Гороскоп",
  description: "Персональный астрологический прогноз на сегодня для вашего знака зодиака с развёрнутым анализом от ИИ.",
  openGraph: {
    title: "Гороскоп | Taro Insight",
    description: "Персональный астрологический прогноз на сегодня для вашего знака зодиака.",
  },
};

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
