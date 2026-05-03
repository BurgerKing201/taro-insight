import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, birthDate, lifePathNumber, destinyNumber, soulNumber } = body;

  if (!name || !birthDate) {
    return NextResponse.json({ error: "Missing name or birthDate" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set OPENROUTER_API_KEY in .env.local" },
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
    const text = (data.choices?.[0]?.message?.content as string) || "Не удалось получить интерпретацию.";
    return NextResponse.json({ interpretation: text });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate interpretation" }, { status: 500 });
  }
}
