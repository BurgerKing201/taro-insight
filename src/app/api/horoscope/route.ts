import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sign, signRu, element, planet, date } = body;

  if (!sign) {
    return NextResponse.json({ error: "Missing sign" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set ANTHROPIC_API_KEY in .env.local" },
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "AI API error", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "Не удалось получить гороскоп.";
    return NextResponse.json({ horoscope: text });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate horoscope" }, { status: 500 });
  }
}
