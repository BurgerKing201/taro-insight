"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { AuthButton } from "@/components/ui/auth-button";
import { tarotCards, TarotCard } from "@/data/tarot-cards";
import { canUseModule, markModuleUsed, saveReading } from "@/lib/usage";

type Phase = "question" | "cards" | "reading";
type SpreadType = "single" | "triple";

const POSITIONS = ["Прошлое", "Настоящее", "Будущее"];

// ─── Responsive card sizes ───────────────────────────────────────────────────
function useCardSizes() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile
    ? { w: 72, h: 112, ml: 36, step: 20, containerH: 220, innerH: 185, maxW: 500 }
    : { w: 117, h: 182, ml: 59, step: 36, containerH: 364, innerH: 312, maxW: 910 };
}

// ─── Star field background ──────────────────────────────────────────────────
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

// ─── Card visuals ────────────────────────────────────────────────────────────
function CardBack() {
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-100 via-white to-purple-200 border-2 border-purple-300 flex items-center justify-center p-2">
      <div className="w-full h-full rounded-lg border border-purple-300 bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-purple-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-500" />
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 text-purple-400">&#10022;</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 text-purple-400">&#10022;</div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 text-purple-400">&#10022;</div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 text-purple-400">&#10022;</div>
        </div>
      </div>
    </div>
  );
}

function CardFront({ card }: { card: TarotCard }) {
  return (
    <div className="w-[85%] h-full mx-auto rounded-2xl border-2 border-purple-500/40 shadow-lg shadow-purple-900/30 bg-[#ffffff] flex items-center justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.imageUrl}
        alt={card.nameRu}
        className="w-full h-full object-contain rounded-2xl"
        draggable={false}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SpreadPage() {
  const router = useRouter();
  const sizes = useCardSizes();
  const [phase, setPhase] = useState<Phase>("question");
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("single");
  const [shuffledCards, setShuffledCards] = useState<TarotCard[]>([]);

  // Single mode
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [reading, setReading] = useState("");

  // Triple mode
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [readings, setReadings] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");

  // ── Question submit ────────────────────────────────────────────────────────
  const doStartSpread = useCallback((message: string) => {
    setQuestion(message);
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setPhase("cards");
  }, []);

  const handleSendQuestion = useCallback(
    async (message: string) => {
      const cleanMessage = message
        .replace(/^\[(Search|Think|Canvas): /, "")
        .replace(/\]$/, "");
      if (!cleanMessage.trim()) return;
      if (!(await canUseModule("spread"))) {
        setPendingQuestion(cleanMessage);
        setShowPaywall(true);
        return;
      }
      await markModuleUsed("spread");
      doStartSpread(cleanMessage);
    },
    [doStartSpread]
  );

  // ── Card selection ─────────────────────────────────────────────────────────
  const handleSelectCard = useCallback(
    async (index: number) => {
      if (isLoading) return;

      // ── Single mode ──────────────────────────────────────────────────────
      if (spreadType === "single") {
        if (selectedCardIndex !== null) return;
        const card = shuffledCards[index];
        setSelectedCardIndex(index);
        setSelectedCard(card);

        setTimeout(async () => {
          setPhase("reading");
          setIsLoading(true);
          try {
            const res = await fetch("/api/reading", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question, card }),
            });
            const data = await res.json();
            const readingText = data.reading ||
              "Не удалось получить толкование. Пожалуйста, убедитесь что API ключ настроен в .env.local";
            setReading(readingText);
            // Сохраняем расклад в историю
            saveReading({
              module: "spread",
              title: `${card.name} — ${question.slice(0, 60)}`,
              input: { question, card: card.name, spreadType: "single" },
              result: readingText,
            });
          } catch {
            setReading("Произошла ошибка при получении толкования. Попробуйте позже.");
          } finally {
            setIsLoading(false);
          }
        }, 1200);
        return;
      }

      // ── Triple mode ──────────────────────────────────────────────────────
      if (selectedIndices.includes(index)) return;
      if (selectedIndices.length >= 3) return;

      const card = shuffledCards[index];
      const newIndices = [...selectedIndices, index];
      const newCards = [...selectedCards, card];
      setSelectedIndices(newIndices);
      setSelectedCards(newCards);

      if (newCards.length === 3) {
        setTimeout(async () => {
          setPhase("reading");
          setIsLoading(true);
          try {
            const res = await fetch("/api/reading", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question, cards: newCards }),
            });
            const data = await res.json();
            const tripleReadings: string[] = data.readings?.length === 3
              ? data.readings
              : ["Не удалось получить толкование.", "Не удалось получить толкование.", "Не удалось получить толкование."];
            setReadings(tripleReadings);
            // Сохраняем расклад в историю
            saveReading({
              module: "spread",
              title: `Три карты — ${question.slice(0, 50)}`,
              input: { question, cards: newCards.map(c => c.name), spreadType: "triple" },
              result: tripleReadings.map((r, i) => `${["Прошлое", "Настоящее", "Будущее"][i]}: ${r}`).join("\n\n"),
            });
          } catch {
            setReadings([
              "Произошла ошибка при получении толкования.",
              "Произошла ошибка при получении толкования.",
              "Произошла ошибка при получении толкования.",
            ]);
          } finally {
            setIsLoading(false);
          }
        }, 1200);
      }
    },
    [
      isLoading,
      spreadType,
      selectedCardIndex,
      selectedIndices,
      selectedCards,
      shuffledCards,
      question,
    ]
  );

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase("question");
    setQuestion("");
    setShuffledCards([]);
    setSelectedCardIndex(null);
    setSelectedCard(null);
    setReading("");
    setSelectedIndices([]);
    setSelectedCards([]);
    setReadings([]);
    setIsLoading(false);
  };

  // ── Derived helpers ────────────────────────────────────────────────────────
  const headerLabel =
    spreadType === "triple" ? "Расклад трёх карт" : "Дневной расклад";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <PaywallModal
        isOpen={showPaywall}
        moduleName="Таро"
        onClose={() => setShowPaywall(false)}
        onSubscribed={() => {
          setShowPaywall(false);
          markModuleUsed("spread");
          doStartSpread(pendingQuestion);
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
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">{headerLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {phase !== "question" && (
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

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pb-8">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════════════════
              PHASE 1 — Question
          ══════════════════════════════════════════════════════════════ */}
          {phase === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-2"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-purple-300 via-white to-purple-300 bg-clip-text text-transparent">
                Задайте ваш вопрос
              </h1>
              <p className="text-gray-400 text-center mb-6 max-w-lg">
                Сконцентрируйтесь на своём вопросе. Это может быть что угодно — от
                повседневных дел до глубоких жизненных вопросов.
              </p>

              {/* ── Spread type toggle ── */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setSpreadType("single")}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    spreadType === "single"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                      : "border border-purple-500/30 text-gray-400 hover:text-white hover:border-purple-500/60"
                  }`}
                >
                  ✦ 1 карта
                </button>
                <button
                  onClick={() => setSpreadType("triple")}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    spreadType === "triple"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                      : "border border-purple-500/30 text-gray-400 hover:text-white hover:border-purple-500/60"
                  }`}
                >
                  ✦✦✦ 3 карты
                </button>
              </div>

              {spreadType === "triple" && (
                <p className="text-purple-400/70 text-xs text-center mb-4 -mt-4">
                  Прошлое · Настоящее · Будущее
                </p>
              )}

              <div className="w-full">
                <PromptInputBox
                  onSend={handleSendQuestion}
                  placeholder="Введите ваш вопрос..."
                  className="border-purple-500/30 hover:border-purple-500/50"
                />
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PHASE 2 — Card Selection
          ══════════════════════════════════════════════════════════════ */}
          {phase === "cards" && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center w-full"
            >
              <div className="mb-4 mt-4 text-center">
                <p className="text-gray-500 text-sm mb-1">Ваш вопрос:</p>
                <p className="text-purple-300 text-lg font-medium italic">
                  &ldquo;{question}&rdquo;
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-2 text-center text-white">
                {spreadType === "single" ? "Выберите карту" : "Выберите три карты"}
              </h2>
              <p className="text-gray-400 text-sm mb-3 text-center">
                {spreadType === "single"
                  ? "Прислушайтесь к интуиции и выберите одну карту из колоды"
                  : "Прислушайтесь к интуиции и последовательно выберите три карты"}
              </p>

              {/* Progress indicator for triple */}
              {spreadType === "triple" && (
                <div className="flex items-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                          i < selectedIndices.length
                            ? "bg-purple-600 border-purple-400 text-white"
                            : i === selectedIndices.length
                            ? "border-purple-500/60 text-purple-400 animate-pulse"
                            : "border-gray-700 text-gray-600"
                        }`}
                      >
                        {i < selectedIndices.length ? "✓" : i + 1}
                      </div>
                      <span
                        className={`text-[10px] transition-all ${
                          i < selectedIndices.length
                            ? "text-purple-400"
                            : "text-gray-600"
                        }`}
                      >
                        {POSITIONS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Card Deck ── */}
              <div
                className="relative w-full max-w-4xl mx-auto flex items-center justify-center"
                style={{ height: `${sizes.containerH}px` }}
              >
                <div
                  className="relative"
                  style={{
                    width: `${Math.min(shuffledCards.length * sizes.step + sizes.ml * 2, sizes.maxW)}px`,
                    height: `${sizes.innerH}px`,
                  }}
                >
                  {shuffledCards.map((card, index) => {
                    const totalCards = shuffledCards.length;
                    const centerOffset = (totalCards - 1) / 2;
                    const xOffset = (index - centerOffset) * sizes.step;

                    // Single mode state
                    const isSingleSelected = spreadType === "single" && selectedCardIndex === index;
                    const isSingleDisabled =
                      spreadType === "single" &&
                      selectedCardIndex !== null &&
                      !isSingleSelected;

                    // Triple mode state
                    const selectionOrder =
                      spreadType === "triple" ? selectedIndices.indexOf(index) : -1;
                    const isTripleSelected = selectionOrder !== -1;
                    const isTripleDisabled =
                      spreadType === "triple" &&
                      selectedIndices.length >= 3 &&
                      !isTripleSelected;

                    const isSelected = isSingleSelected || isTripleSelected;
                    const isDisabled = isSingleDisabled || isTripleDisabled;

                    const animateProps =
                      spreadType === "single"
                        ? {
                            x: isSingleSelected ? 0 : xOffset,
                            y: isSingleSelected ? -20 : 0,
                            opacity: isDisabled ? 0.3 : 1,
                            rotate: isSingleSelected ? 0 : (index - centerOffset) * 0.8,
                            scale: isSingleSelected ? 1.2 : 1,
                            zIndex: isSingleSelected ? 50 : index,
                          }
                        : {
                            x: xOffset,
                            y: isTripleSelected ? -12 : 0,
                            opacity: isDisabled ? 0.2 : 1,
                            rotate: isTripleSelected ? 0 : (index - centerOffset) * 0.8,
                            scale: isTripleSelected ? 1.06 : 1,
                            zIndex: isTripleSelected ? 50 : index,
                          };

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ x: xOffset, y: 100, opacity: 0, rotate: 0 }}
                        animate={animateProps}
                        transition={{ duration: 0.5, delay: index * 0.02 }}
                        className={`absolute left-1/2 top-0 perspective-[800px] ${
                          isDisabled ? "pointer-events-none" : "cursor-pointer"
                        } ${isSelected ? "card-flipped" : ""}`}
                        onClick={() => !isDisabled && handleSelectCard(index)}
                        whileHover={
                          !isSelected && !isDisabled
                            ? {
                                y: -15,
                                scale: 1.08,
                                zIndex: 50,
                                transition: { duration: 0.2 },
                              }
                            : undefined
                        }
                        style={{
                          zIndex: isSelected ? 50 : index,
                          marginLeft: `-${sizes.ml}px`,
                          width: `${sizes.w}px`,
                          height: `${sizes.h}px`,
                        }}
                      >
                        <div className="card-inner relative w-full h-full">
                          <div className="card-back">
                            <CardBack />
                          </div>
                          <div className="card-front">
                            <CardFront card={card} />
                          </div>
                        </div>

                        {/* Triple: position badge */}
                        {spreadType === "triple" && isTripleSelected && (
                          <div className="absolute -top-2 -right-2 z-[60] w-6 h-6 rounded-full bg-purple-600 border-2 border-purple-300 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                            {selectionOrder + 1}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PHASE 3 — Reading
          ══════════════════════════════════════════════════════════════ */}
          {phase === "reading" && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center w-full max-w-3xl pt-6 px-2"
            >

              {/* ── Single card display ── */}
              {spreadType === "single" && selectedCard && (
                <div className="flex flex-col items-center mb-8">
                  <div className="w-[120px] h-[185px] sm:w-[156px] sm:h-[241px] mb-4 animate-float">
                    <CardFront card={selectedCard} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {selectedCard.nameRu}
                  </h2>
                  <p className="text-purple-400 text-sm">{selectedCard.name}</p>
                </div>
              )}

              {/* ── Triple cards display ── */}
              {spreadType === "triple" && selectedCards.length === 3 && (
                <div className="flex justify-center gap-2 sm:gap-4 mb-8 w-full">
                  {selectedCards.map((card, i) => (
                    <div key={card.id} className="flex flex-col items-center gap-2 flex-1 max-w-[110px] sm:max-w-[143px]">
                      <p className="text-purple-400 text-[10px] font-semibold tracking-widest uppercase">
                        {POSITIONS[i]}
                      </p>
                      <div className="w-full h-[130px] sm:h-[169px] animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
                        <CardFront card={card} />
                      </div>
                      <p className="text-white text-xs font-medium text-center leading-tight">
                        {card.nameRu}
                      </p>
                      <p className="text-purple-400/60 text-[10px] text-center">{card.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Question ── */}
              <div className="w-full mb-6 text-center">
                <p className="text-gray-500 text-sm mb-1">Ваш вопрос:</p>
                <p className="text-purple-300 italic">&ldquo;{question}&rdquo;</p>
              </div>

              {/* ── Loading spinner ── */}
              {isLoading && (
                <div className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400">Карты раскрывают свои тайны...</p>
                  </div>
                </div>
              )}

              {/* ── Single reading result ── */}
              {!isLoading && spreadType === "single" && reading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8"
                >
                  {reading.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="text-gray-200 leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </motion.div>
              )}

              {/* ── Triple reading result ── */}
              {!isLoading && spreadType === "triple" && readings.length === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full space-y-4"
                >
                  {readings.map((text, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-sm p-5 md:p-6"
                    >
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <span className="text-purple-300 text-sm font-semibold">
                            {POSITIONS[i]}
                          </span>
                          <span className="text-gray-600 text-xs ml-2">
                            — {selectedCards[i]?.nameRu}
                          </span>
                        </div>
                      </div>
                      {text.split("\n\n").map((paragraph, j) => (
                        <p
                          key={j}
                          className="text-gray-200 leading-relaxed mb-3 last:mb-0 text-sm"
                        >
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── Reset button ── */}
              {!isLoading && (reading || readings.length > 0) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleReset}
                  className="mt-8 px-6 py-3 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Новый расклад
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
