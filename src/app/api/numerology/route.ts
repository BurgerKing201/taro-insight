import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, birthDate, lifePathNumber, destinyNumber, soulNumber } = body;

  if (!name || !birthDate) {
    return NextResponse.json({ error: "Missing name or birthDate" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set ANTHROPIC_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const systemPrompt = `Ты — опытный нумеролог и мистик. Ты даёшь глубокие, мудрые и персонализированные нумерологические интерпретации.
Отвечай на русском языке. Используй мистический, но понятный стиль.
Структурируй ответ в три блока, разделённых пустой строкой (без заголовков с #):

1. Общая картина: Как три числа взаимодействуют, создавая уникальный нумерологический портрет человека (3–4 предложения).
2. Жизненный путь и предназначение: Что числа говорят о миссии и судьбе человека (3–4 предложения).
3. Совет и напутствие: Практический совет от числовых энергий (2–3 предложения).

Обращайся к человеку по имени. Будь конкретен и вдохновляющ.`;

  const userMessage = `Имя: ${name}
Дата рождения: ${birthDate}
Число жизненного пути: ${lifePathNumber}
Число судьбы (по имени): ${destinyNumber}
Число души: ${soulNumber}`;

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
    const text = data.content?.[0]?.text || "Не удалось получить интерпретацию.";
    return NextResponse.json({ interpretation: text });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
  }
}
