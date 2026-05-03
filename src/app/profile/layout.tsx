import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Личный кабинет Taro Insight. История раскладов и персональные настройки.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
