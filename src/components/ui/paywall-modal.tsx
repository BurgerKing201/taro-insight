"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Sparkles, Check, Star } from "lucide-react";
import { subscribe } from "@/lib/usage";

interface PaywallModalProps {
  isOpen: boolean;
  moduleName: string;
  onClose: () => void;
  onSubscribed: () => void;
}

const PLANS = [
  {
    id: "monthly" as const,
    label: "Месячная",
    price: "299 ₽",
    period: "в месяц",
    sub: null,
    popular: false,
  },
  {
    id: "annual" as const,
    label: "Годовая",
    price: "1 990 ₽",
    period: "в год",
    sub: "166 ₽/мес",
    popular: true,
  },
];

const FEATURES = [
  "Безлимитный доступ ко всем модулям",
  "Таро, Нумерология, Совместимость, Гороскоп",
  "Глубокие AI-интерпретации без ограничений",
  "Сохранение истории раскладов",
];

export function PaywallModal({ isOpen, moduleName, onClose, onSubscribed }: PaywallModalProps) {
  const [selected, setSelected] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    // Simulated payment delay
    await new Promise((r) => setTimeout(r, 1200));
    await subscribe(selected);
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 900));
    setSuccess(false);
    onSubscribed();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-md bg-[#0d0d18] border border-purple-500/30 rounded-3xl p-6 shadow-2xl shadow-purple-900/50 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Success state */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-3xl bg-[#0d0d18] flex flex-col items-center justify-center z-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-20 h-20 rounded-full bg-purple-600/30 border-2 border-purple-400 flex items-center justify-center mb-4"
                    >
                      <Check className="w-10 h-10 text-purple-300" />
                    </motion.div>
                    <p className="text-white text-xl font-bold">Подписка активирована!</p>
                    <p className="text-gray-400 text-sm mt-2">Добро пожаловать в Astral Insight Premium</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-purple-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white text-center mb-1">
                Лимит на сегодня исчерпан
              </h2>
              <p className="text-gray-400 text-sm text-center mb-5">
                Вы уже использовали <span className="text-purple-300">{moduleName}</span> сегодня.
                Оформите подписку для безлимитного доступа.
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Plans */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer text-center ${
                      selected === plan.id
                        ? "border-purple-400 bg-purple-500/15 shadow-lg shadow-purple-900/30"
                        : "border-purple-500/20 bg-white/[0.02] hover:border-purple-500/40"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                        <Star className="w-2.5 h-2.5" /> Выгоднее
                      </span>
                    )}
                    <span className="text-xs text-gray-400 mb-1">{plan.label}</span>
                    <span className="text-white font-bold text-base">{plan.price}</span>
                    <span className="text-gray-500 text-[11px]">{plan.period}</span>
                    {plan.sub && (
                      <span className="text-purple-400 text-[11px] mt-0.5">{plan.sub}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-base transition-all hover:from-purple-500 hover:to-purple-400 glow-purple cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Оформить подписку
                  </>
                )}
              </motion.button>

              {/* Dismiss */}
              <button
                onClick={onClose}
                className="w-full text-center text-gray-500 text-sm mt-3 hover:text-gray-400 transition-colors cursor-pointer py-1"
              >
                Вернуться завтра →
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
