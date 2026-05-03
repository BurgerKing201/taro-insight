import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Совместимость",
  description: "Нумерологическая совместимость двух людей по именам и датам рождения. Узнайте насколько вы подходите друг другу.",
  openGraph: {
    title: "Совместимость | Taro Insight",
    description: "Нумерологическая совместимость двух людей по именам и датам рождения.",
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
