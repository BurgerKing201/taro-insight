import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sign, signRu, element, planet, date } = body;

  if (!sign) {
    return NextResponse.json({ error: "Missing sign" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set OPENROUTER_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const systemPrompt = `Ты — опытный астролог с глубоким знанием планетарных влияний и знаков зодиака.
Отвечай на русском языке. Используй мистический, вдохновляющий и тёплый стиль.
Составь гороскоп на указанную дату для знака зодиака. Структурируй ответ в четыре блока, разделённых пустой строкой (без заголовков с #):

1. Общая энергетика дня: Какие космические энергии действуют сегодня для этого знака (2–3 предложения).
2. Любовь и отношения: Что говорят звёзды об отношениях и чувствах (2–3 предложения).
3. Работа и финансы: Влияние планет на профессиональную сферу (2–3 предложения).
4. Совет дня: Конкретная рекомендация от звёзд — что принесёт удачу сегодня (1–2 предложения).

Учитывай элемент знака и планету-покровитель при составлении гороскопа.`;

  const userMessage = `Знак зодиака: ${signRu} (${sign})
Элемент: ${element}
Планета-покровитель: ${planet}
Дата: ${date}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "https://taroinsight.space",
        "X-Title": "Taro Insight",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: "AI API error", details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const text = (data.choices?.[0]?.message?.content as string) || "Не удалось получить гороскоп.";
    return NextResponse.json({ horoscope: text });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate horoscope" }, { status: 500 });
  }
}
