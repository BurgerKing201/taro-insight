import { NextRequest, NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b:free";

async function callAI(system: string, user: string, maxTokens: number, apiKey: string) {
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
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { status: response.status, details: errorData };
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content as string) || "";
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, card, cards } = body;

  const isTriple = Array.isArray(cards) && cards.length === 3;

  if (!question || (!card && !isTriple)) {
    return NextResponse.json({ error: "Missing question or card(s)" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set OPENROUTER_API_KEY in environment variables." },
      { status: 500 }
    );
  }

  // ─── SINGLE CARD ───────────────────────────────────────────────────────────
  if (!isTriple) {
    const systemPrompt = `Ты — опытный таролог и мистик. Ты даёшь глубокие, мудрые и красиво структурированные толкования карт Таро.
Отвечай на русском языке. Используй мистический, но понятный стиль.
Структурируй ответ так:
1. Краткое описание карты и её энергии (2-3 предложения)
2. Толкование в контексте вопроса (3-4 предложения)
3. Совет карты (2-3 предложения)

Не используй заголовки с #. Разделяй блоки пустой строкой. Будь конкретен в привязке к вопросу.`;

    const userMessage = `Вопрос: "${question}"
Выпавшая карта: ${card.nameRu} (${card.name})
Значение карты: ${card.meaning}
Ключевые слова: ${card.keywords.join(", ")}`;

    try {
      const text = await callAI(systemPrompt, userMessage, 1024, apiKey);
      return NextResponse.json({ reading: text || "Не удалось получить ответ." });
    } catch (error: unknown) {
      console.error("AI API error:", error);
      const err = error as { status?: number; details?: unknown };
      if (err.status) {
        return NextResponse.json({ error: "AI API error", details: err.details }, { status: err.status });
      }
      return NextResponse.json({ error: "Failed to generate reading" }, { status: 500 });
    }
  }

  // ─── TRIPLE CARD ───────────────────────────────────────────────────────────
  const positions = ["Прошлое", "Настоящее", "Будущее"];

  const systemPrompt = `Ты — опытный таролог и мистик. Ты проводишь расклад из трёх карт Таро по позициям: Прошлое, Настоящее, Будущее.
Отвечай на русском языке. Используй мистический, но понятный стиль.

Дай отдельное толкование для каждой позиции. Строго используй следующий формат с тегами-разделителями:

<card1>
Краткое описание энергии карты Прошлого (2 предложения). Как эта карта отражает прошлый опыт в контексте вопроса (2-3 предложения). Что это прошлое говорит о ситуации сейчас (1-2 предложения).
</card1>

<card2>
Краткое описание энергии карты Настоящего (2 предложения). Что карта говорит о текущей ситуации в контексте вопроса (2-3 предложения). На что обратить внимание прямо сейчас (1-2 предложения).
</card2>

<card3>
Краткое описание энергии карты Будущего (2 предложения). К чему ведёт эта энергия в контексте вопроса (2-3 предложения). Совет и напутствие карты (1-2 предложения).
</card3>

Не используй заголовки с #. Внутри тегов разделяй абзацы пустой строкой. Будь конкретен в привязке к вопросу.`;

  const userMessage = `Вопрос: "${question}"

Расклад из трёх карт:
${cards
  .map(
    (c: { nameRu: string; name: string; meaning: string; keywords: string[] }, i: number) =>
      `Позиция "${positions[i]}": ${c.nameRu} (${c.name})\nЗначение: ${c.meaning}\nКлючевые слова: ${c.keywords.join(", ")}`
  )
  .join("\n\n")}`;

  try {
    const text = await callAI(systemPrompt, userMessage, 2048, apiKey);

    // Parse sections between <card1>…</card1> etc.
    const readings: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const match = text.match(new RegExp(`<card${i}>([\\s\\S]*?)<\\/card${i}>`, "i"));
      readings.push(match ? match[1].trim() : "Не удалось получить толкование.");
    }

    return NextResponse.json({ readings });
  } catch (error: unknown) {
    console.error("AI API error:", error);
    const err = error as { status?: number; details?: unknown };
    if (err.status) {
      return NextResponse.json({ error: "AI API error", details: err.details }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to generate reading" }, { status: 500 });
  }
}
