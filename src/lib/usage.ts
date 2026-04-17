import { createClient } from "@/lib/supabase/client";

// ─── localStorage fallback (for unauthenticated users) ───────────────────────
const PREFIX = "astral_usage_";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function isSubscribed(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("astral_subscribed") === "true";
  }
  const { data } = await supabase
    .from("profiles")
    .select("subscribed, subscribed_until")
    .eq("id", user.id)
    .single();
  if (!data) return false;
  if (data.subscribed_until && new Date(data.subscribed_until) < new Date()) return false;
  return data.subscribed === true;
}

export async function subscribe(plan: "monthly" | "annual"): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const months = plan === "annual" ? 12 : 1;
  const until = new Date();
  until.setMonth(until.getMonth() + months);

  if (user) {
    await supabase.from("profiles").update({
      subscribed: true,
      subscribed_until: until.toISOString(),
    }).eq("id", user.id);
  } else {
    if (typeof window !== "undefined") {
      localStorage.setItem("astral_subscribed", "true");
    }
  }
}

// ─── Module usage ─────────────────────────────────────────────────────────────

export async function canUseModule(module: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (await isSubscribed()) return true;

  if (user) {
    const { data } = await supabase
      .from("module_usage")
      .select("id")
      .eq("user_id", user.id)
      .eq("module", module)
      .eq("used_at", todayStr())
      .maybeSingle();
    return !data;
  }

  // Fallback for guests
  if (typeof window === "undefined") return true;
  return !localStorage.getItem(`${PREFIX}${module}_${todayStr()}`);
}

export async function markModuleUsed(module: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("module_usage").upsert({
      user_id: user.id,
      module,
      used_at: todayStr(),
    }, { onConflict: "user_id,module,used_at" });
  } else {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${PREFIX}${module}_${todayStr()}`, "1");
    }
  }
}

// ─── Save reading to history ──────────────────────────────────────────────────

export async function saveReading(params: {
  module: string;
  title: string;
  input: Record<string, unknown>;
  result: string;
}): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("readings").insert({
    user_id: user.id,
    module: params.module,
    title: params.title,
    input: params.input,
    result: params.result,
  });
}
