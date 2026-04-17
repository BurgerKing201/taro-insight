"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Moon, Star, Sun } from "lucide-react";
import { motion } from "framer-motion";

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

      {/* Purple glow orbs */}
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-lg font-semibold tracking-wide text-white">Astral Insight</span>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent"
        >
          Astral Insight
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-10"
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
          className="mb-16 group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-xl tracking-wide transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:scale-105 glow-purple cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            Сделать дневной расклад
            <Sparkles className="w-5 h-5" />
          </span>
        </motion.button>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full"
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
            title="Астрология"
            description="Персональные астрологические прогнозы на основе вашей натальной карты."
            delay={0.2}
          />
          <ServiceCard
            icon={<Sun className="w-8 h-8" />}
            title="Гороскопы"
            description="Ежедневные, еженедельные и месячные гороскопы для вашего знака зодиака."
            delay={0.3}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
        Astral Insight &copy; {new Date().getFullYear()}
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
      className={`group p-8 rounded-2xl border border-purple-500/10 bg-white/[0.02] backdrop-blur-sm hover:border-purple-500/30 hover:bg-white/[0.04] transition-all duration-300 ${href ? "cursor-pointer hover:scale-[1.02]" : ""}`}
    >
      <div className="text-purple-400 mb-4 group-hover:text-purple-300 transition-colors [&>svg]:w-10 [&>svg]:h-10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-base text-gray-400 leading-relaxed">{description}</p>
      {href && (
        <p className="text-purple-500 text-sm mt-3 group-hover:text-purple-400 transition-colors">
          Открыть →
        </p>
      )}
    </motion.div>
  );
}
