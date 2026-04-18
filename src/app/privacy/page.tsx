"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer mb-10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          На главную
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">Политика конфиденциальности</h1>
        <p className="text-gray-500 text-sm mb-10">Последнее обновление: 18 апреля 2026 г.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности описывает, как сервис <strong className="text-white">Taro Insight</strong> собирает,
              использует и защищает информацию, которую вы предоставляете при использовании нашего сайта и приложения.
              Используя сервис, вы соглашаетесь с условиями данной политики.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Какие данные мы собираем</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300">Адрес электронной почты</span> — при регистрации или входе через Google</li>
              <li><span className="text-gray-300">Имя и дата рождения</span> — если вы указываете их в профиле (необязательно)</li>
              <li><span className="text-gray-300">История раскладов</span> — результаты использования модулей (Таро, Нумерология, Совместимость, Гороскоп)</li>
              <li><span className="text-gray-300">Данные об использовании</span> — какие модули и когда были использованы (для соблюдения лимитов)</li>
              <li><span className="text-gray-300">Платёжные данные</span> — мы не храним данные карт; оплата обрабатывается сервисом ЮKassa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Как мы используем данные</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Для предоставления функций сервиса и персонализации</li>
              <li>Для отслеживания лимитов бесплатного использования</li>
              <li>Для хранения истории ваших раскладов в личном кабинете</li>
              <li>Для обработки подписки и проверки её статуса</li>
              <li>Мы <strong className="text-white">не продаём</strong> и не передаём ваши данные третьим лицам в маркетинговых целях</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Сторонние сервисы</h2>
            <p className="text-gray-400 mb-2">Мы используем следующие сторонние сервисы, у каждого из которых есть собственная политика конфиденциальности:</p>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300">Supabase</span> — хранение данных и аутентификация</li>
              <li><span className="text-gray-300">Google OAuth</span> — вход через аккаунт Google (по вашему желанию)</li>
              <li><span className="text-gray-300">ЮKassa</span> — обработка платежей</li>
              <li><span className="text-gray-300">OpenAI</span> — генерация интерпретаций (запросы не содержат персональных данных)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Хранение и защита данных</h2>
            <p className="text-gray-400">
              Данные хранятся на защищённых серверах Supabase с шифрованием в покое и при передаче (TLS).
              Доступ к данным ограничен политиками безопасности на уровне строк (Row Level Security) —
              каждый пользователь видит только свои данные.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Ваши права</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Вы можете в любой момент обновить или удалить данные профиля в личном кабинете</li>
              <li>Вы можете запросить полное удаление аккаунта и всех связанных данных</li>
              <li>Вы можете отозвать доступ Google OAuth в настройках своего аккаунта Google</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Файлы cookie и localStorage</h2>
            <p className="text-gray-400">
              Мы используем cookie исключительно для поддержания сессии авторизации (через Supabase Auth).
              Для незарегистрированных пользователей данные об использовании модулей временно хранятся
              в localStorage браузера и не передаются на сервер.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Изменения политики</h2>
            <p className="text-gray-400">
              Мы можем обновлять данную политику. При существенных изменениях мы уведомим вас по email.
              Актуальная версия всегда доступна на этой странице.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Контакты</h2>
            <p className="text-gray-400">
              По вопросам, связанным с конфиденциальностью данных, пишите на:{" "}
              <a href="mailto:support@taro-insight.ru" className="text-purple-400 hover:text-purple-300 transition-colors">
                support@taro-insight.ru
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
