"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CookiePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer mb-10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Политика использования Cookie</h1>
        <p className="text-gray-500 text-sm mb-10">Последнее обновление: 27 апреля 2026 г.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Что такое cookie</h2>
            <p className="text-gray-400">
              Cookie — это небольшие текстовые файлы, которые сохраняются в вашем браузере при посещении сайта.
              Они помогают сайту запоминать ваши действия и предпочтения, чтобы вам не приходилось вводить
              их заново при каждом посещении.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Какие cookie мы используем</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-purple-500/15">
                <p className="text-white font-medium mb-1">Необходимые cookie</p>
                <p className="text-gray-400">
                  Используются исключительно для поддержания сессии авторизации через Supabase Auth.
                  Без этих cookie вход в аккаунт невозможен. Отключить их нельзя.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-purple-500/15">
                <p className="text-white font-medium mb-1">Функциональные cookie</p>
                <p className="text-gray-400">
                  Сохраняют ваши предпочтения (например, данные о лимитах использования модулей
                  для незарегистрированных пользователей через localStorage). Не передаются на сервер.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Что мы не используем</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Рекламные и маркетинговые cookie</li>
              <li>Трекеры для отслеживания поведения между сайтами</li>
              <li>Cookie третьих сторон для аналитики (Google Analytics и т.п.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Сторонние сервисы</h2>
            <p className="text-gray-400">
              Сервис Supabase может устанавливать собственные cookie для работы аутентификации.
              Оплата через ЮKassa обрабатывается на стороне ЮKassa — их cookie регулируются
              собственной политикой конфиденциальности ЮKassa.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Управление cookie</h2>
            <p className="text-gray-400">
              Вы можете управлять cookie в настройках браузера: отключать, удалять или блокировать их.
              Обратите внимание, что отключение необходимых cookie приведёт к невозможности входа в аккаунт.
            </p>
            <p className="text-gray-400 mt-3">
              Инструкции для популярных браузеров:
            </p>
            <ul className="space-y-1 list-disc list-inside text-gray-400 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/ru/kb/udalenie-kukov-firefox" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Safari</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Согласие</h2>
            <p className="text-gray-400">
              Продолжая использовать сайт taroinsight.space, вы соглашаетесь с использованием
              необходимых cookie. Если вы не согласны — пожалуйста, покиньте сайт или отключите
              cookie в настройках браузера.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Контакты</h2>
            <p className="text-gray-400">
              По вопросам, связанным с использованием cookie, пишите на:{" "}
              <a href="mailto:support@taroinsight.space" className="text-purple-400 hover:text-purple-300 transition-colors">
                support@taroinsight.space
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
          © 2026 Taro Insight. Все права защищены.
        </div>
      </div>
    </div>
  );
}
