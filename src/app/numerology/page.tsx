"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RotateCcw, Hash } from "lucide-react";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { AuthButton } from "@/components/ui/auth-button";
import { canUseModule, markModuleUsed } from "@/lib/usage";

// ─── Numerology helpers ──────────────────────────────────────────────────────

function reduceToSingleDigit(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  const sum = String(n)
    .split("")
    .reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

function calculateLifePath(birthDate: string): number {
  const digits = birthDate.replace(/-/g, "").split("").map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceToSingleDigit(sum);
}

const LETTER_VALUES: Record<string, number> = {
  // Latin
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  // Cyrillic
  а: 1, б: 2, в: 3, г: 4, д: 5, е: 6, ё: 7, ж: 8, з: 9,
  и: 1, й: 2, к: 3, л: 4, м: 5, н: 6, о: 7, п: 8, р: 9,
  с: 1, т: 2, у: 3, ф: 4, х: 5, ц: 6, ч: 7, ш: 8, щ: 9,
  ъ: 1, ы: 2, ь: 3, э: 4, ю: 5, я: 6,
};

const VOWELS = new Set([
  "a", "e", "i", "o", "u",
  "а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я",
]);

function calculateDestiny(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-zа-яё]/g, "").split("");
  const sum = letters.reduce((acc, l) => acc + (LETTER_VALUES[l] || 0), 0);
  return reduceToSingleDigit(sum);
}

function calculateSoul(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-zа-яё]/g, "").split("");
  const vowels = letters.filter((l) => VOWELS.has(l));
  const sum = vowels.reduce((acc, l) => acc + (LETTER_VALUES[l] || 0), 0);
  return reduceToSingleDigit(sum);
}

// ─── Number meanings ─────────────────────────────────────────────────────────

const NUMBER_INFO: Record<number, { title: string; description: string; keywords: string[] }> = {
  1: { title: "Лидер", description: "Число независимости и лидерства. Первопроходец с сильной волей и оригинальным мышлением.", keywords: ["лидерство", "независимость", "инициатива"] },
  2: { title: "Дипломат", description: "Число партнёрства и гармонии. Чувствительность, интуиция и умение работать в команде.", keywords: ["партнёрство", "гармония", "дипломатия"] },
  3: { title: "Творец", description: "Число творчества и самовыражения. Общительность, артистизм и вдохновение.", keywords: ["творчество", "общение", "радость"] },
  4: { title: "Строитель", description: "Число стабильности и труда. Практичность, надёжность и прочный фундамент.", keywords: ["стабильность", "труд", "порядок"] },
  5: { title: "Искатель", description: "Число свободы и перемен. Любовь к приключениям, адаптивность и жажда нового.", keywords: ["свобода", "перемены", "авантюризм"] },
  6: { title: "Воспитатель", description: "Число любви и ответственности. Забота, гармония и преданность близким.", keywords: ["любовь", "семья", "ответственность"] },
  7: { title: "Мистик", description: "Число духовного поиска. Аналитический ум, интуиция и стремление к глубинным знаниям.", keywords: ["мудрость", "духовность", "анализ"] },
  8: { title: "Достигатель", description: "Число власти и успеха. Амбициозность, целеустремлённость и деловое чутьё.", keywords: ["успех", "власть", "материальность"] },
  9: { title: "Гуманист", description: "Число завершения и мудрости. Альтруизм, сострадание и любовь к миру.", keywords: ["гуманизм", "мудрость", "завершение"] },
  11: { title: "Интуит", description: "Мастер-число духовного просветления. Высокая чувствительность и интуиция.", keywords: ["интуиция", "просветление", "вдохновение"] },
  22: { title: "Мастер-строитель", description: "Мастер-число великих свершений. Воплощение масштабных мечт в реальность.", keywords: ["мастерство", "видение", "созидание"] },
  33: { title: "Мастер-учитель", description: "Мастер-число высшей любви. Исцеление, мудрость и вдохновение других.", keywords: ["исцеление", "учение", "безусловная любовь"] },
};

// ─── Star field ──────────────────────────────────────────────────────────────

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

// ─── Number card ─────────────────────────────────────────────────────────────

function NumberCard({
  label,
  number,
  delay,
}: {
  label: string;
  number: number;
  delay: number;
}) {
  const info = NUMBER_INFO[number];
  const isMaster = number === 11 || number === 22 || number === 33;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`flex flex-col items-center p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] ${
        isMaster
          ? "border-purple-400/50 shadow-lg shadow-purple-900/20"
          : "border-purple-500/20 hover:border-purple-500/40"
      }`}
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-purple-400/70 mb-3">
        {label}
      </p>
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 text-2xl font-bold ${
          isMaster
            ? "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-900/40"
            : "bg-purple-600/20 border border-purple-500/30 text-purple-200"
        }`}
      >
        {number}
      </div>
      {info && (
        <>
          <p className="text-white font-semibold text-sm mb-1">{info.title}</p>
          <p className="text-gray-400 text-xs text-center leading-relaxed mb-3">
            {info.description}
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {info.keywords.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px]"
              >
                {kw}
              </span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = "input" | "result";

export default function NumerologyPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [lifePathNumber, setLifePathNumber] = useState(0);
  const [destinyNumber, setDestinyNumber] = useState(0);
  const [soulNumber, setSoulNumber] = useState(0);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

  const doCalculate = async () => {
    const lp = calculateLifePath(birthDate);
    const dn = calculateDestiny(name);
    const sn = calculateSoul(name);

    setLifePathNumber(lp);
    setDestinyNumber(dn);
    setSoulNumber(sn);
    setPhase("result");
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/numerology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          lifePathNumber: lp,
          destinyNumber: dn,
          soulNumber: sn,
        }),
      });
      const data = await res.json();
      setInterpretation(
        data.interpretation ||
          "Не удалось получить интерпретацию. Убедитесь, что API ключ настроен в .env.local"
      );
    } catch {
      setError("Произошла ошибка при получении интерпретации. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;
    if (!(await canUseModule("numerology"))) {
      setShowPaywall(true);
      return;
    }
    await markModuleUsed("numerology");
    await doCalculate();
  };

  const handleReset = () => {
    setPhase("input");
    setName("");
    setBirthDate("");
    setLifePathNumber(0);
    setDestinyNumber(0);
    setSoulNumber(0);
    setInterpretation("");
    setError("");
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <PaywallModal
        isOpen={showPaywall}
        moduleName="Нумерологию"
        onClose={() => setShowPaywall(false)}
        onSubscribed={async () => {
          setShowPaywall(false);
          await markModuleUsed("numerology");
          doCalculate();
        }}
      />
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Нумерология</span>
        </div>
        <div className="flex items-center gap-2">
          {phase === "result" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Заново</span>
            </button>
          )}
          <AuthButton />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-12">
        <AnimatePresence mode="wait">

          {/* ══ PHASE 1 — Input ══ */}
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-lg"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6"
              >
                <Hash className="w-8 h-8 text-purple-400" />
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                Нумерология
              </h1>
              <p className="text-gray-400 text-sm md:text-base text-center mb-8 max-w-md">
                Раскройте тайный смысл чисел в вашей жизни. Введите ваше полное имя и дату рождения.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Полное имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше полное имя..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Дата рождения</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-base md:text-lg tracking-wide transition-all duration-300 hover:from-purple-500 hover:to-purple-400 glow-purple cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Раскрыть числа судьбы
                  <Sparkles className="w-5 h-5" />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ══ PHASE 2 — Result ══ */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center w-full max-w-2xl pt-6"
            >
              {/* Name & date */}
              <div className="text-center mb-8">
                <p className="text-gray-500 text-sm mb-1">Нумерологический портрет</p>
                <p className="text-white text-xl font-semibold">{name}</p>
                <p className="text-purple-400 text-sm mt-1">
                  {new Date(birthDate + "T00:00:00").toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Three numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
                <NumberCard label="Число жизненного пути" number={lifePathNumber} delay={0.1} />
                <NumberCard label="Число судьбы" number={destinyNumber} delay={0.2} />
                <NumberCard label="Число души" number={soulNumber} delay={0.3} />
              </div>

              {/* AI interpretation */}
              {isLoading && (
                <div className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Числа открывают свои тайны...</p>
                  </div>
                </div>
              )}

              {!isLoading && error && (
                <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              )}

              {!isLoading && interpretation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-semibold tracking-wide uppercase">
                      Интерпретация
                    </span>
                  </div>
                  {interpretation.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-gray-200 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              )}

              {!isLoading && (interpretation || error) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleReset}
                  className="mt-8 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Новый расчёт
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
