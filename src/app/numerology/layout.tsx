import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нумерология",
  description: "Нумерологический анализ по имени и дате рождения. Узнайте число судьбы, число души и ваш жизненный путь.",
  openGraph: {
    title: "Нумерология | Taro Insight",
    description: "Нумерологический анализ по имени и дате рождения.",
  },
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
