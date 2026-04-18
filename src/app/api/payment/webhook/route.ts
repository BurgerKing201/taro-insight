import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// YooKassa webhook handler
// Configure your webhook URL in YooKassa dashboard:
// https://yookassa.ru/my/merchant/integration/http-notifications
// URL: https://yourdomain.com/api/payment/webhook

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    // We only care about succeeded payments
    if (event.event !== "payment.succeeded") {
      return NextResponse.json({ ok: true });
    }

    const payment = event.object;
    const { user_id, plan } = payment.metadata ?? {};

    if (!user_id || !plan) {
      console.error("Webhook: missing metadata", payment.metadata);
      return NextResponse.json({ ok: true });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Activate subscription
    const months = plan === "annual" ? 12 : 1;
    const until = new Date();
    until.setMonth(until.getMonth() + months);

    await Promise.all([
      supabase.from("profiles").update({
        subscribed: true,
        subscribed_until: until.toISOString(),
      }).eq("id", user_id),

      supabase.from("payments").update({
        status: "succeeded",
      }).eq("id", payment.id),
    ]);

    console.log(`✅ Subscription activated for user ${user_id}, plan ${plan}`);
    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("Webhook error:", e);
    // Return 200 so YooKassa doesn't retry
    return NextResponse.json({ ok: true });
  }
}
