"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, RotateCcw, Sparkles } from "lucide-react";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { canUseModule, markModuleUsed } from "@/lib/usage";

// ─── Zodiac data ──────────────────────────────────────────────────────────────

const SIGNS = [
  { id: "aries",       nameRu: "Овен",       symbol: "♈", dates: "21.03 — 19.04", element: "Огонь", elementEn: "Fire",  planet: "Марс",    color: "from-red-500/20 to-orange-500/20",    border: "border-red-500/30"    },
  { id: "taurus",      nameRu: "Телец",      symbol: "♉", dates: "20.04 — 20.05", element: "Земля", elementEn: "Earth", planet: "Венера",  color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30"  },
  { id: "gemini",      nameRu: "Близнецы",   symbol: "♊", dates: "21.05 — 20.06", element: "Воздух",elementEn: "Air",   planet: "Меркурий",color: "from-yellow-500/20 to-amber-500/20",  border: "border-yellow-500/30" },
  { id: "cancer",      nameRu: "Рак",        symbol: "♋", dates: "21.06 — 22.07", element: "Вода",  elementEn: "Water", planet: "Луна",    color: "from-blue-400/20 to-cyan-400/20",     border: "border-blue-400/30"   },
  { id: "leo",         nameRu: "Лев",        symbol: "♌", dates: "23.07 — 22.08", element: "Огонь", elementEn: "Fire",  planet: "Солнце",  color: "from-orange-500/20 to-yellow-500/20", border: "border-orange-500/30" },
  { id: "virgo",       nameRu: "Дева",       symbol: "♍", dates: "23.08 — 22.09", element: "Земля", elementEn: "Earth", planet: "Меркурий",color: "from-emerald-500/20 to-teal-500/20",  border: "border-emerald-500/30"},
  { id: "libra",       nameRu: "Весы",       symbol: "♎", dates: "23.09 — 22.10", element: "Воздух",elementEn: "Air",   planet: "Венера",  color: "from-pink-500/20 to-rose-500/20",     border: "border-pink-500/30"   },
  { id: "scorpio",     nameRu: "Скорпион",   symbol: "♏", dates: "23.10 — 21.11", element: "Вода",  elementEn: "Water", planet: "Плутон",  color: "from-purple-600/20 to-indigo-600/20", border: "border-purple-600/30" },
  { id: "sagittarius", nameRu: "Стрелец",    symbol: "♐", dates: "22.11 — 21.12", element: "Огонь", elementEn: "Fire",  planet: "Юпитер",  color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30" },
  { id: "capricorn",   nameRu: "Козерог",    symbol: "♑", dates: "22.12 — 19.01", element: "Земля", elementEn: "Earth", planet: "Сатурн",  color: "from-slate-500/20 to-gray-500/20",    border: "border-slate-500/30"  },
  { id: "aquarius",    nameRu: "Водолей",    symbol: "♒", dates: "20.01 — 18.02", element: "Воздух",elementEn: "Air",   planet: "Уран",    color: "from-sky-500/20 to-blue-500/20",      border: "border-sky-500/30"    },
  { id: "pisces",      nameRu: "Рыбы",       symbol: "♓", dates: "19.02 — 20.03", element: "Вода",  elementEn: "Water", planet: "Нептун",  color: "from-indigo-400/20 to-blue-400/20",   border: "border-indigo-400/30" },
] as const;

type Sign = typeof SIGNS[number];

// ─── Element badge ────────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<string, string> = {
  Огонь:  "text-orange-300 bg-orange-500/10 border-orange-500/20",
  Земля:  "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  Воздух: "text-sky-300 bg-sky-500/10 border-sky-500/20",
  Вода:   "text-blue-300 bg-blue-500/10 border-blue-500/20",
};

// ─── Star field ───────────────────────────────────────────────────────────────

function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
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

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = "select" | "reading";

export default function HoroscopePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("select");
  const [selected, setSelected] = useState<Sign | null>(null);
  const [horoscope, setHoroscope] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingSign, setPendingSign] = useState<Sign | null>(null);

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const doFetchHoroscope = async (sign: Sign) => {
    setSelected(sign);
    setPhase("reading");
    setIsLoading(true);
    setHoroscope("");
    setError("");

    try {
      const res = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sign: sign.id,
          signRu: sign.nameRu,
          element: sign.element,
          planet: sign.planet,
          date: today,
        }),
      });
      const data = await res.json();
      setHoroscope(
        data.horoscope ||
        "Не удалось получить гороскоп. Убедитесь, что API ключ настроен в .env.local"
      );
    } catch {
      setError("Произошла ошибка при получении гороскопа. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (sign: Sign) => {
    if (!canUseModule("horoscope")) {
      setPendingSign(sign);
      setShowPaywall(true);
      return;
    }
    markModuleUsed("horoscope");
    doFetchHoroscope(sign);
  };

  const handleReset = () => {
    setPhase("select");
    setSelected(null);
    setHoroscope("");
    setError("");
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <PaywallModal
        isOpen={showPaywall}
        moduleName="Гороскоп"
        onClose={() => setShowPaywall(false)}
        onSubscribed={() => {
          setShowPaywall(false);
          if (pendingSign) {
            markModuleUsed("horoscope");
            doFetchHoroscope(pendingSign);
            setPendingSign(null);
          }
        }}
      />
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            Гороскоп<span className="hidden sm:inline"> · {today}</span>
          </span>
        </div>
        {phase === "reading" ? (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Сменить знак</span>
          </button>
        ) : <div className="w-8 md:w-24" />}
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-12">
        <AnimatePresence mode="wait">

          {/* ══ PHASE 1 — Sign selection ══ */}
          {phase === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl"
            >
              <div className="text-center mb-10 mt-2">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                  Гороскоп
                </h1>
                <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
                  Выберите ваш знак зодиака, чтобы получить персональный прогноз на сегодня.
                </p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {SIGNS.map((sign, i) => (
                  <motion.button
                    key={sign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(sign)}
                    className={`flex flex-col items-center gap-1 p-3 md:p-4 rounded-2xl border bg-gradient-to-br ${sign.color} ${sign.border} hover:brightness-125 transition-all duration-200 cursor-pointer`}
                  >
                    <span className="text-2xl md:text-3xl">{sign.symbol}</span>
                    <span className="text-white text-[11px] md:text-xs font-semibold text-center leading-tight">{sign.nameRu}</span>
                    <span className="text-gray-400 text-[9px] md:text-[10px] hidden sm:block">{sign.dates}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══ PHASE 2 — Reading ══ */}
          {phase === "reading" && selected && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center w-full max-w-2xl pt-4"
            >
              {/* Sign header */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`w-24 h-24 rounded-full bg-gradient-to-br ${selected.color} border ${selected.border} flex items-center justify-center mb-4 animate-float`}
              >
                <span className="text-5xl">{selected.symbol}</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-1"
              >
                {selected.nameRu}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-gray-400 text-sm mb-4"
              >
                {selected.dates}
              </motion.p>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-8"
              >
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${ELEMENT_COLORS[selected.element]}`}>
                  {selected.element}
                </span>
                <span className="px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-xs font-medium">
                  {selected.planet}
                </span>
              </motion.div>

              {/* Loading */}
              {isLoading && (
                <div className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Звёзды составляют ваш прогноз...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {!isLoading && error && (
                <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}

              {/* Horoscope */}
              {!isLoading && horoscope && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-semibold tracking-wide uppercase">
                      Прогноз на {today}
                    </span>
                  </div>
                  {horoscope.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-gray-200 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              )}

              {!isLoading && (horoscope || error) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleReset}
                  className="mt-8 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Другой знак
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
