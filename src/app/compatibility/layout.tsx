import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нумерологическая совместимость пар онлайн",
  description: "Проверьте нумерологическую совместимость двух людей по именам и датам рождения. Бесплатный расчёт совместимости онлайн.",
  openGraph: {
    title: "Нумерологическая совместимость пар онлайн",
    description: "Проверьте нумерологическую совместимость двух людей по именам и датам рождения.",
    url: "https://taroinsight.space/compatibility",
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
