"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Moon, Star, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { AuthButton } from "@/components/ui/auth-button";

function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.5,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <StarField />

      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-base font-semibold tracking-wide text-white">Taro Insight</span>
        </div>
        <AuthButton />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent"
        >
          Taro Insight
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-xl text-gray-400 max-w-2xl mb-8 md:mb-10 px-2"
        >
          Раскройте тайны вселенной через древнюю мудрость Таро, нумерологии и астрологии.
          Получите персональное толкование с помощью искусственного интеллекта.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          onClick={() => router.push("/spread")}
          className="mb-12 md:mb-16 w-full sm:w-auto group relative px-7 py-4 md:px-10 md:py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-base md:text-xl tracking-wide transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:scale-105 glow-purple cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2 md:gap-3">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
            Сделать дневной расклад
            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
          </span>
        </motion.button>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl w-full"
        >
          <ServiceCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Таро"
            description="Гадание на картах Таро для ответов на ваши вопросы о жизни, любви и карьере."
            delay={0}
            href="/spread"
          />
          <ServiceCard
            icon={<Moon className="w-8 h-8" />}
            title="Нумерология"
            description="Узнайте тайный смысл чисел в вашей жизни и их влияние на судьбу."
            delay={0.1}
            href="/numerology"
          />
          <ServiceCard
            icon={<Star className="w-8 h-8" />}
            title="Совместимость"
            description="Узнайте нумерологическую совместимость двух людей по именам и датам рождения."
            delay={0.2}
            href="/compatibility"
          />
          <ServiceCard
            icon={<Sun className="w-8 h-8" />}
            title="Гороскоп"
            description="Персональный прогноз на сегодня для вашего знака зодиака от звёздного ИИ."
            delay={0.3}
            href="/horoscope"
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-gray-600 text-sm flex items-center justify-center gap-4">
        <span>Taro Insight &copy; {new Date().getFullYear()}</span>
        <a href="/privacy" className="hover:text-gray-400 transition-colors">Политика конфиденциальности</a>
      </footer>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  delay,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  href?: string;
}) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + delay }}
      onClick={() => href && router.push(href)}
      className={`group p-4 md:p-8 rounded-2xl border border-purple-500/10 bg-white/[0.02] backdrop-blur-sm hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300 ${href ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""}`}
    >
      <div className="text-purple-400 mb-3 group-hover:text-purple-300 transition-colors [&>svg]:w-7 [&>svg]:h-7 md:[&>svg]:w-10 md:[&>svg]:h-10">
        {icon}
      </div>
      <h3 className="text-base md:text-xl font-semibold text-white mb-1 md:mb-2">{title}</h3>
      <p className="text-xs md:text-base text-gray-400 leading-relaxed hidden sm:block">{description}</p>
      {href && (
        <p className="text-purple-500 text-xs md:text-sm mt-2 md:mt-3 group-hover:text-purple-400 transition-colors">
          Открыть →
        </p>
      )}
    </motion.div>
  );
}
