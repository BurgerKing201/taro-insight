"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown } from "lucide-react";

function StarField() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="absolute w-[2px] h-[2px] bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
      ))}
    </div>
  );
}

const PLAN_LABELS: Record<string, string> = {
  monthly: "Месячная подписка",
  annual:  "Годовая подписка",
};

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan") ?? "monthly";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(t);
          router.push("/");
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
      >
        {/* Animated check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 250, damping: 18 }}
          className="w-24 h-24 rounded-full bg-purple-600/25 border-2 border-purple-400 flex items-center justify-center mb-6"
        >
          <Check className="w-12 h-12 text-purple-300" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Premium активирован</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Оплата прошла!</h1>
          <p className="text-gray-400 text-base mb-1">
            {PLAN_LABELS[plan] ?? "Подписка"} успешно оформлена.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Теперь у вас безлимитный доступ ко всем модулям Astral Insight.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Перейти к модулям
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors cursor-pointer py-1"
            >
              Личный кабинет →
            </button>
          </div>

          <p className="text-gray-600 text-xs mt-6">
            Автоматический переход через {countdown} сек.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
