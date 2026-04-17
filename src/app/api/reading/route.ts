import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { question, card, cards } = body;

  const isTriple = Array.isArray(cards) && cards.length === 3;

  if (!question || (!card && !isTriple)) {
    return NextResponse.json({ error: "Missing question or card(s)" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set ANTHROPIC_API_KEY in .env.local" },
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
      const text = data.content?.[0]?.text || "Не удалось получить ответ.";
      return NextResponse.json({ reading: text });
    } catch (error) {
      console.error("AI API error:", error);
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
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
    const text: string = data.content?.[0]?.text || "";

    // Parse sections between <card1>…</card1> etc.
    const readings: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const match = text.match(new RegExp(`<card${i}>([\\s\\S]*?)<\\/card${i}>`, "i"));
      readings.push(match ? match[1].trim() : "Не удалось получить толкование.");
    }

    return NextResponse.json({ readings });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "Failed to generate reading" }, { status: 500 });
  }
}
