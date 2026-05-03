import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { person1, person2, score, lifePathA, lifePathB, destinyA, destinyB, soulA, soulB } = body;

  if (!person1?.name || !person2?.name) {
    return NextResponse.json({ error: "Missing person data" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set OPENROUTER_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const systemPrompt = `Ты — опытный нумеролог и астролог, специализирующийся на совместимости людей.
Отвечай на русском языке. Используй мистический, тёплый и вдохновляющий стиль.
Структурируй ответ в три блока, разделённых пустой строкой (без заголовков с #):

1. Энергетика союза: Как числа двух людей взаимодействуют, что создаёт их уникальную связь (3–4 предложения).
2. Сильные стороны и вызовы: Что будет давать силу этим отношениям, и где потребуется работа (3–4 предложения).
3. Совет и напутствие: Как усилить гармонию и раскрыть потенциал этого союза (2–3 предложения).

Обращайся к обоим людям по именам. Будь конкретен и вдохновляющ.`;

  const userMessage = `Первый человек: ${person1.name} (дата рождения: ${person1.birthDate})
Число жизненного пути: ${lifePathA}, Число судьбы: ${destinyA}, Число души: ${soulA}

Второй человек: ${person2.name} (дата рождения: ${person2.birthDate})
Число жизненного пути: ${lifePathB}, Число судьбы: ${destinyB}, Число души: ${soulB}

Общий балл совместимости: ${score}%`;

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
