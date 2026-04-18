import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const PLANS = {
  monthly: { amount: "299.00", description: "Подписка Taro Insight — Месячная" },
  annual:  { amount: "1990.00", description: "Подписка Taro Insight — Годовая" },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan: "monthly" | "annual" };

    if (!PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get current user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cs) { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shopId     = process.env.YOOKASSA_SHOP_ID!;
    const secretKey  = process.env.YOOKASSA_SECRET_KEY!;
    const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const idempotenceKey = randomUUID();

    const body = {
      amount: { value: PLANS[plan].amount, currency: "RUB" },
      confirmation: {
        type: "redirect",
        return_url: `${siteUrl}/payment/success?plan=${plan}`,
      },
      capture: true,
      description: PLANS[plan].description,
      metadata: { user_id: user.id, plan },
    };

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        Authorization: "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("YooKassa error:", err);
      return NextResponse.json({ error: "Payment creation failed" }, { status: 502 });
    }

    const payment = await response.json();

    // Store pending payment in DB
    await supabase.from("payments").insert({
      id: payment.id,
      user_id: user.id,
      plan,
      status: "pending",
    });

    return NextResponse.json({ url: payment.confirmation.confirmation_url });

  } catch (e) {
    console.error("create payment error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
