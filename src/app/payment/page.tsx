"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Sparkles, Check, Zap } from "lucide-react";
import { StarField } from "@/components/ui/star-field";

const PLANS = [
  {
    id: "monthly" as const,
    label: "Месяц",
    price: "299",
    period: "/ мес",
    description: "Попробуйте без долгих обязательств",
    badge: null,
  },
  {
    id: "annual" as const,
    label: "Год",
    price: "1 990",
    period: "/ год",
    pricePerMonth: "166 ₽ / мес",
    description: "Экономия 44% по сравнению с месячной",
    badge: "Выгоднее",
  },
];

const FEATURES = [
  "Безлимитные расклады Таро",
  "Персональная нумерология",
  "Совместимость без ограничений",
  "Гороскоп каждый день",
  "История всех раскладов",
];

export default function PaymentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        setError(data.error ?? "Ошибка создания платежа");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Не удалось подключиться к серверу");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <header className="relative z-10 px-4 md:px-8 py-5">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Назад</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
              <Crown className="w-7 h-7 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Premium доступ</h1>
            <p className="text-gray-400 text-sm">Безлимитный доступ ко всем модулям</p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-2">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selected === plan.id
                    ? "border-purple-500/60 bg-purple-600/15"
                    : "border-purple-500/15 bg-white/[0.02] hover:border-purple-500/30"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <p className="text-xs text-gray-500 mb-1">{plan.label}</p>
                <p className="text-xl font-bold text-white">{plan.price} ₽</p>
                <p className="text-xs text-gray-500">{plan.period}</p>
                {plan.pricePerMonth && (
                  <p className="text-xs text-purple-400 mt-1">{plan.pricePerMonth}</p>
                )}
              </button>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center mb-3 px-2">{error}</motion.p>
          )}

          {/* Pay button */}
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handlePay}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm tracking-wide hover:from-purple-500 hover:to-purple-400 transition-all glow-purple cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Оплатить {selected === "annual" ? "1 990 ₽" : "299 ₽"}
              </>
            )}
          </motion.button>

          <p className="text-center text-gray-600 text-xs mt-4">
            Оплата через ЮKassa · Данные карты защищены
          </p>

          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="/oferta" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Оферта</a>
            <a href="/privacy" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">Конфиденциальность</a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
