"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function OfertaPage() {
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

        <h1 className="text-3xl font-bold text-white mb-2">Публичная оферта</h1>
        <p className="text-gray-500 text-sm mb-10">Последнее обновление: 21 апреля 2026 г.</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Общие положения</h2>
            <p className="text-gray-400">
              Настоящий документ является публичной офертой Абибулаева Тимура Руслановича
              (самозанятый, г. Новороссийск, ИНН указан в чеке), далее — <strong className="text-white">Исполнитель</strong>,
              и адресован любому физическому лицу, далее — <strong className="text-white">Пользователь</strong>,
              которое воспользовалось сервисом <strong className="text-white">Taro Insight</strong> (taroinsight.space).
            </p>
            <p className="text-gray-400 mt-3">
              Оплата услуг Исполнителя означает полное и безоговорочное принятие Пользователем
              условий настоящей оферты в соответствии со ст. 438 ГК РФ.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Предмет оферты</h2>
            <p className="text-gray-400">
              Исполнитель предоставляет Пользователю доступ к онлайн-сервису Taro Insight —
              платформе для получения персональных интерпретаций на основе Таро, нумерологии,
              астрологии и гороскопов. Услуга носит <strong className="text-white">развлекательно-информационный характер</strong> и
              не является заменой профессиональной психологической, медицинской или юридической помощи.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Тарифы и оплата</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li><span className="text-gray-300">Бесплатный доступ</span> — ограниченное количество запросов в день без оплаты</li>
              <li><span className="text-gray-300">Месячная подписка</span> — безлимитный доступ ко всем модулям на 30 дней</li>
              <li><span className="text-gray-300">Годовая подписка</span> — безлимитный доступ ко всем модулям на 365 дней</li>
            </ul>
            <p className="text-gray-400 mt-3">
              Актуальные цены на тарифы указаны на сайте taroinsight.space.
              Оплата производится через сервис ЮKassa. Исполнитель формирует чек в соответствии
              с требованиями ФЗ-422 (самозанятые).
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Порядок оказания услуг</h2>
            <p className="text-gray-400">
              После успешной оплаты подписка активируется автоматически в течение нескольких минут.
              Доступ предоставляется в личном кабинете Пользователя на сайте taroinsight.space.
              Услуга считается оказанной с момента предоставления доступа к сервису.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Возврат денежных средств</h2>
            <p className="text-gray-400">
              Пользователь вправе запросить возврат средств в течение <strong className="text-white">3 календарных дней</strong> с
              момента оплаты, если услуга не была оказана по техническим причинам на стороне Исполнителя.
              После активации подписки и предоставления доступа возврат не производится, так как услуга
              считается оказанной (ст. 25 Закона о защите прав потребителей — цифровые услуги).
            </p>
            <p className="text-gray-400 mt-3">
              Для запроса возврата обращайтесь на почту:{" "}
              <a href="mailto:support@taroinsight.space" className="text-purple-400 hover:text-purple-300 transition-colors">
                support@taroinsight.space
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Ограничение ответственности</h2>
            <p className="text-gray-400">
              Сервис Taro Insight предоставляется в развлекательных целях. Исполнитель не несёт
              ответственности за решения, принятые Пользователем на основании полученных интерпретаций.
              Исполнитель не гарантирует точность, полноту или применимость результатов раскладов
              к реальным жизненным ситуациям.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Персональные данные</h2>
            <p className="text-gray-400">
              Обработка персональных данных осуществляется в соответствии с{" "}
              <a href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
                Политикой конфиденциальности
              </a>.
              Оплачивая услуги, Пользователь даёт согласие на обработку персональных данных
              в объёме, необходимом для исполнения настоящей оферты.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Срок действия оферты</h2>
            <p className="text-gray-400">
              Оферта вступает в силу с момента размещения на сайте и действует бессрочно.
              Исполнитель вправе в одностороннем порядке изменить условия оферты, разместив
              актуальную версию на сайте. Изменения вступают в силу с момента публикации.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Контакты исполнителя</h2>
            <ul className="space-y-1 text-gray-400">
              <li><span className="text-gray-300">Исполнитель:</span> Абибулаев Тимур Русланович</li>
              <li><span className="text-gray-300">Статус:</span> Самозанятый (плательщик НПД)</li>
              <li><span className="text-gray-300">Город:</span> Новороссийск</li>
              <li>
                <span className="text-gray-300">Email:</span>{" "}
                <a href="mailto:support@taroinsight.space" className="text-purple-400 hover:text-purple-300 transition-colors">
                  support@taroinsight.space
                </a>
              </li>
              <li><span className="text-gray-300">Сайт:</span> taroinsight.space</li>
            </ul>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
          © 2026 Taro Insight. Все права защищены.
        </div>
      </div>
    </div>
  );
}
