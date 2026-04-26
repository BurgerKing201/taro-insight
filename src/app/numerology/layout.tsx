import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нумерология онлайн — расчёт числа судьбы",
  description: "Бесплатный расчёт нумерологии по дате рождения и имени. Узнайте ваше число судьбы, число жизненного пути и их влияние на вашу жизнь.",
  openGraph: {
    title: "Нумерология онлайн — расчёт числа судьбы",
    description: "Бесплатный расчёт нумерологии по дате рождения и имени.",
    url: "https://taroinsight.space/numerology",
  },
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
