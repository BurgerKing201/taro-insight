"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, RotateCcw, Sparkles } from "lucide-react";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { AuthButton } from "@/components/ui/auth-button";
import { canUseModule, markModuleUsed } from "@/lib/usage";

// ─── Numerology helpers ──────────────────────────────────────────────────────

function reduceToSingleDigit(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduceToSingleDigit(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
}

function calculateLifePath(birthDate: string): number {
  const sum = birthDate.replace(/-/g, "").split("").reduce((a, d) => a + parseInt(d), 0);
  return reduceToSingleDigit(sum);
}

const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
  а:1,б:2,в:3,г:4,д:5,е:6,ё:7,ж:8,з:9,
  и:1,й:2,к:3,л:4,м:5,н:6,о:7,п:8,р:9,
  с:1,т:2,у:3,ф:4,х:5,ц:6,ч:7,ш:8,щ:9,
  ъ:1,ы:2,ь:3,э:4,ю:5,я:6,
};
const VOWELS = new Set(["a","e","i","o","u","а","е","ё","и","о","у","ы","э","ю","я"]);

function calcDestiny(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-zа-яё]/g, "").split("");
  return reduceToSingleDigit(letters.reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0));
}

function calcSoul(name: string): number {
  const letters = name.toLowerCase().replace(/[^a-zа-яё]/g, "").split("");
  return reduceToSingleDigit(
    letters.filter(l => VOWELS.has(l)).reduce((a, l) => a + (LETTER_VALUES[l] || 0), 0)
  );
}

// ─── Compatibility matrix (life path pairs → base score 0–100) ───────────────

const COMPAT_MATRIX: Record<string, number> = {
  "1-1":70,"1-2":80,"1-3":88,"1-4":55,"1-5":92,"1-6":65,"1-7":75,"1-8":60,"1-9":70,
  "2-2":75,"2-3":80,"2-4":88,"2-5":58,"2-6":92,"2-7":65,"2-8":75,"2-9":80,
  "3-3":72,"3-4":52,"3-5":88,"3-6":80,"3-7":62,"3-8":65,"3-9":92,
  "4-4":78,"4-5":52,"4-6":88,"4-7":72,"4-8":92,"4-9":58,
  "5-5":68,"5-6":62,"5-7":82,"5-8":65,"5-9":75,
  "6-6":88,"6-7":58,"6-8":70,"6-9":92,
  "7-7":78,"7-8":52,"7-9":70,
  "8-8":65,"8-9":58,
  "9-9":82,
};

function getBaseScore(a: number, b: number): number {
  const normA = a > 9 ? Math.floor(a / 11) + 1 : a;
  const normB = b > 9 ? Math.floor(b / 11) + 1 : b;
  const key = normA <= normB ? `${normA}-${normB}` : `${normB}-${normA}`;
  return COMPAT_MATRIX[key] ?? 70;
}

function calcCompatibility(
  lpA: number, lpB: number,
  dnA: number, dnB: number,
  snA: number, snB: number
): number {
  const lpScore = getBaseScore(lpA, lpB);
  const dnScore = getBaseScore(dnA, dnB);
  const snScore = getBaseScore(snA, snB);
  // Weighted: life path 50%, destiny 30%, soul 20%
  return Math.round(lpScore * 0.5 + dnScore * 0.3 + snScore * 0.2);
}

// ─── Score label & color ─────────────────────────────────────────────────────

function getScoreInfo(score: number): { label: string; color: string; ring: string } {
  if (score >= 85) return { label: "Звёздный союз", color: "text-purple-300", ring: "stroke-purple-400" };
  if (score >= 70) return { label: "Сильная связь", color: "text-indigo-300", ring: "stroke-indigo-400" };
  if (score >= 55) return { label: "Гармоничный союз", color: "text-blue-300", ring: "stroke-blue-400" };
  return { label: "Путь к гармонии", color: "text-gray-300", ring: "stroke-gray-400" };
}

// ─── Circular score indicator ────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { label, color, ring } = getScoreInfo(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={ring}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`text-sm font-semibold tracking-wide ${color}`}
      >
        {label}
      </motion.p>
    </div>
  );
}

// ─── Person numbers card ─────────────────────────────────────────────────────

function PersonCard({
  name,
  lp, dn, sn,
  delay,
}: {
  name: string;
  lp: number; dn: number; sn: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex-1 rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-3 md:p-5"
    >
      <p className="text-white font-semibold text-base mb-4 text-center truncate">{name}</p>
      <div className="space-y-3">
        {[
          { label: "Жизненный путь", value: lp },
          { label: "Число судьбы", value: dn },
          { label: "Число души", value: sn },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-gray-400 text-xs">{label}</span>
            <span className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-200 text-sm font-bold flex-shrink-0">
              {value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

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

type Phase = "input" | "result";

interface Person { name: string; birthDate: string; }

export default function CompatibilityPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("input");
  const [p1, setP1] = useState<Person>({ name: "", birthDate: "" });
  const [p2, setP2] = useState<Person>({ name: "", birthDate: "" });

  const [lpA, setLpA] = useState(0); const [lpB, setLpB] = useState(0);
  const [dnA, setDnA] = useState(0); const [dnB, setDnB] = useState(0);
  const [snA, setSnA] = useState(0); const [snB, setSnB] = useState(0);
  const [score, setScore] = useState(0);

  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

  const doCalculate = async () => {
    const a = { lp: calculateLifePath(p1.birthDate), dn: calcDestiny(p1.name), sn: calcSoul(p1.name) };
    const b = { lp: calculateLifePath(p2.birthDate), dn: calcDestiny(p2.name), sn: calcSoul(p2.name) };
    const total = calcCompatibility(a.lp, b.lp, a.dn, b.dn, a.sn, b.sn);

    setLpA(a.lp); setLpB(b.lp);
    setDnA(a.dn); setDnB(b.dn);
    setSnA(a.sn); setSnB(b.sn);
    setScore(total);
    setPhase("result");
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: p1, person2: p2, score: total,
          lifePathA: a.lp, lifePathB: b.lp,
          destinyA: a.dn, destinyB: b.dn,
          soulA: a.sn, soulB: b.sn,
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
    if (!p1.name.trim() || !p1.birthDate || !p2.name.trim() || !p2.birthDate) return;
    if (!(await canUseModule("compatibility"))) {
      setShowPaywall(true);
      return;
    }
    await markModuleUsed("compatibility");
    await doCalculate();
  };

  const handleReset = () => {
    setPhase("input");
    setP1({ name: "", birthDate: "" });
    setP2({ name: "", birthDate: "" });
    setInterpretation(""); setError(""); setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <PaywallModal
        isOpen={showPaywall}
        moduleName="Совместимость"
        onClose={() => setShowPaywall(false)}
        onSubscribed={async () => {
          setShowPaywall(false);
          await markModuleUsed("compatibility");
          doCalculate();
        }}
      />
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Совместимость</span>
        </div>
        <div className="flex items-center gap-2">
          {phase === "result" && (
            <button onClick={handleReset} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
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
              className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-6"
              >
                <Heart className="w-8 h-8 text-purple-400" />
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                Совместимость
              </h1>
              <p className="text-gray-400 text-sm md:text-base text-center mb-8 max-w-md">
                Узнайте, что числа говорят о вашем союзе. Введите имена и даты рождения двух людей.
              </p>

              <form onSubmit={handleSubmit} className="w-full space-y-6">
                {/* Two person inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Person 1 */}
                  <div className="rounded-2xl border border-purple-500/20 bg-white/[0.02] p-5 space-y-4">
                    <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase">Первый</p>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Имя</label>
                      <input
                        type="text"
                        value={p1.name}
                        onChange={e => setP1(v => ({ ...v, name: e.target.value }))}
                        placeholder="Полное имя..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Дата рождения</label>
                      <input
                        type="date"
                        value={p1.birthDate}
                        onChange={e => setP1(v => ({ ...v, birthDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark] text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Person 2 */}
                  <div className="rounded-2xl border border-purple-500/20 bg-white/[0.02] p-5 space-y-4">
                    <p className="text-purple-400 text-xs font-semibold tracking-widest uppercase">Второй</p>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Имя</label>
                      <input
                        type="text"
                        value={p2.name}
                        onChange={e => setP2(v => ({ ...v, name: e.target.value }))}
                        placeholder="Полное имя..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-purple-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Дата рождения</label>
                      <input
                        type="date"
                        value={p2.birthDate}
                        onChange={e => setP2(v => ({ ...v, birthDate: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-purple-500/20 text-white focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark] text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-base md:text-lg tracking-wide transition-all duration-300 hover:from-purple-500 hover:to-purple-400 glow-purple cursor-pointer flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  Узнать совместимость
                  <Heart className="w-5 h-5" />
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
              {/* Names */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 mb-8 text-center max-w-full overflow-hidden"
              >
                <span className="text-white font-semibold text-base md:text-lg min-w-0 truncate">{p1.name}</span>
                <Heart className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-white font-semibold text-base md:text-lg min-w-0 truncate">{p2.name}</span>
              </motion.div>

              {/* Score ring */}
              <div className="mb-8">
                <ScoreRing score={score} />
              </div>

              {/* Person number cards */}
              <div className="flex gap-4 w-full mb-8">
                <PersonCard name={p1.name} lp={lpA} dn={dnA} sn={snA} delay={0.4} />
                <PersonCard name={p2.name} lp={lpB} dn={dnB} sn={snB} delay={0.5} />
              </div>

              {/* AI interpretation */}
              {isLoading && (
                <div className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Звёзды читают ваш союз...</p>
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
                      Анализ союза
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
