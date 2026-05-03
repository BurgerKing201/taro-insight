# Taro Insight — контекст проекта

## Проект
- **Название:** Taro Insight (бывший Astral Insight)
- **Репозиторий:** https://github.com/stokth/astral-insight
- **Стек:** Next.js 16.2.3, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Supabase, OpenAI

## Supabase
- **URL:** https://qwyitztwzwxkpebedibr.supabase.co
- **Anon key:** sb_publishable_umX6qGFrxi-x2YXE_ZI1vw_VA9IUg5b
- **Таблицы:** profiles, module_usage, readings, payments
- **SQL схема:** supabase-schema.sql (в корне проекта)

## .env.local (заполнить вручную)
```
NEXT_PUBLIC_SUPABASE_URL=https://qwyitztwzwxkpebedibr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_umX6qGFrxi-x2YXE_ZI1vw_VA9IUg5b
SUPABASE_SERVICE_ROLE_KEY=        ← Supabase Dashboard → Settings → API
YOOKASSA_SHOP_ID=                 ← кабинет ЮKassa
YOOKASSA_SECRET_KEY=              ← кабинет ЮKassa
NEXT_PUBLIC_SITE_URL=http://localhost:3000  ← заменить на домен
```

## Google OAuth
- **Client ID:** 544119085504-3tkm5ejfe58i11tt34lu1dnooh06h2be.apps.googleusercontent.com
- **Redirect URI:** https://qwyitztwzwxkpebedibr.supabase.co/auth/v1/callback
- **Статус:** OAuth клиент создан, Google provider в Supabase включён (Enabled)
- **НО:** приложение в статусе Testing — нужен домен для верификации и публикации

## Структура страниц
```
/                    — главная с 4 модулями
/spread              — Таро расклад (single + triple)
/numerology          — Нумерология (3 числа: жизненный путь, судьба, душа)
/compatibility       — Совместимость (два человека, даты рождения)
/horoscope           — Гороскоп (12 знаков)
/profile             — Личный кабинет (история, настройки, подписка)
/auth/login          — Вход (email + Google OAuth)
/auth/register       — Регистрация
/auth/callback       — OAuth callback
/payment/success     — Страница успешной оплаты
/privacy             — Политика конфиденциальности
```

## Ключевые файлы
```
src/lib/usage.ts              — canUseModule, markModuleUsed, saveReading, isSubscribed, subscribe
src/lib/supabase/client.ts    — createBrowserClient
src/lib/supabase/server.ts    — createServerClient
src/middleware.ts             — обновление сессии Supabase
src/components/ui/paywall-modal.tsx   — пейволл (редирект на ЮKassa)
src/components/ui/auth-button.tsx     — кнопка логина/профиля в хедере
src/app/api/payment/create/route.ts   — создание платежа ЮKassa
src/app/api/payment/webhook/route.ts  — webhook ЮKassa (активирует подписку)
```

## Логика пейволла
- 1 бесплатное использование в день на модуль
- Авторизованные пользователи: трекинг через таблицу module_usage в Supabase
- Гости: localStorage
- Подписка: monthly (299₽) или annual (1990₽) через ЮKassa
- После оплаты: webhook активирует profiles.subscribed = true

## Карты Таро
- Сид на основе даты + имени пользователя → одинаковый порядок карт весь день
- Сохранение расклада в таблицу readings после получения AI-ответа
- Single + Triple режим

## Что НЕ сделано (pending)
1. **Google OAuth верификация** — нужен домен. Сейчас статус Testing.
   - Купить домен → задеплоить на Vercel → подтвердить в Google Search Console → Submit for verification
   - Потом добавить домен в Authorized JavaScript origins в Google Cloud Console
2. **ЮKassa** — ключи ещё не вписаны в .env.local (YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)
3. **SUPABASE_SERVICE_ROLE_KEY** — нужен для webhook, ещё не вписан
4. **Домен в NEXT_PUBLIC_SITE_URL** — пока localhost

## Оптимизации которые нужно сделать (найдены аудитом)
1. **StarField дублируется в 5 файлах** — вынести в `src/components/ui/star-field.tsx` с useMemo (сейчас Math.random() в render → hydration mismatch)
2. **N+1 запросы в canUseModule** — внутри вызывает isSubscribed() которая делает свой getUser(), итого 2 вызова getUser. Нужно объединить в Promise.all
3. **AuthButton возвращает null при загрузке** → layout shift. Нужен skeleton `<div className="w-16 h-8 rounded-xl bg-white/5 animate-pulse" />`
4. **saveReading не вызывается в horoscope и compatibility** — только в spread. Нужно добавить
5. **Кнопки Submit не disabled при isLoading** в numerology и compatibility — можно задвоить запросы
6. **resize без debounce** в useCardSizes — стреляет десятки раз в секунду
7. **layout.tsx: только latin subset** — кириллица падает на системный шрифт

## Последний коммит
- `d415988` — rebrand: Astral Insight → Taro Insight
- Branch: master
