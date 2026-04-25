"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Calendar, LogOut, Star, Clock,
  Sparkles, Crown, ChevronRight, Edit2, Check, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSubscribed } from "@/lib/usage";
import { StarField } from "@/components/ui/star-field";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null;
  birth_date: string | null;
  subscribed: boolean;
  subscribed_until: string | null;
  created_at: string;
}

interface Reading {
  id: string;
  module: string;
  title: string | null;
  result: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  spread:        "Таро",
  numerology:    "Нумерология",
  compatibility: "Совместимость",
  horoscope:     "Гороскоп",
};

const MODULE_ICONS: Record<string, string> = {
  spread:        "🃏",
  numerology:    "🔢",
  compatibility: "💞",
  horoscope:     "⭐",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short",
  });
}

// ─── Reading card ─────────────────────────────────────────────────────────────

function ReadingCard({ reading }: { reading: Reading }) {
  const [expanded, setExpanded] = useState(false);
  const preview = reading.result.slice(0, 120) + (reading.result.length > 120 ? "…" : "");

  return (
    <motion.div
      layout
      className="border border-purple-500/15 rounded-2xl bg-white/[0.02] overflow-hidden"
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span className="text-xl mt-0.5">{MODULE_ICONS[reading.module] ?? "✨"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white">
              {reading.title || MODULE_LABELS[reading.module] || reading.module}
            </span>
            <span className="text-[11px] text-gray-500 flex-shrink-0">
              {formatDateShort(reading.created_at)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{preview}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-purple-500/10">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mt-3">
                {reading.result}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Editable name field ──────────────────────────────────────────────────────

function EditableField({
  label, value, onSave,
}: {
  label: string;
  value: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="flex-1 bg-white/[0.05] border border-purple-500/30 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/60"
            placeholder={label}
          />
          <button onClick={handleSave} disabled={saving}
            className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 hover:bg-purple-600/50 transition-colors cursor-pointer disabled:opacity-50">
            {saving ? <div className="w-3 h-3 border border-purple-300/40 border-t-purple-300 rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => { setEditing(false); setDraft(value); }}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-white">{value || <span className="text-gray-500">Не указано</span>}</span>
          <button onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "settings">("history");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/auth/login"); return; }

        setEmail(user.email ?? "");

        const [profileRes, readingsRes, sub] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("readings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
          isSubscribed(),
        ]);

        setProfile(profileRes.data ?? null);
        setReadings(readingsRes.data ?? []);
        setSubscribed(sub);
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateProfile = async (patch: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").update(patch).eq("id", user.id).select().single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      <StarField />
      <div className="fixed top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-5">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">На главную</span>
        </button>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Личный кабинет</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-sm">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Выйти</span>
        </button>
      </header>

      <main className="relative z-10 flex-1 px-4 md:px-8 pb-12 max-w-2xl mx-auto w-full">

        {/* Avatar + name */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8 mt-2">
          <div className="w-20 h-20 rounded-full bg-purple-600/20 border-2 border-purple-500/40 flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {profile?.full_name || email.split("@")[0] || "Пользователь"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{email}</p>

          {/* Subscription badge */}
          {subscribed ? (
            <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-sm">
              <Crown className="w-4 h-4" />
              <span>Premium активен</span>
              {profile?.subscribed_until && (
                <span className="text-gray-500 text-xs">до {formatDate(profile.subscribed_until)}</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-purple-500/20 text-gray-400 hover:text-purple-300 hover:border-purple-500/40 transition-all cursor-pointer text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Получить Premium</span>
            </button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-purple-500/10 mb-6">
          {(["history", "settings"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab
                ? "bg-purple-600/25 text-purple-200 border border-purple-500/30"
                : "text-gray-500 hover:text-gray-300"
              }`}>
              {tab === "history" ? (
                <span className="flex items-center justify-center gap-2"><Clock className="w-4 h-4" />История</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><User className="w-4 h-4" />Профиль</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "history" ? (
            <motion.div key="history" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.2 }}>
              {readings.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <Star className="w-12 h-12 text-purple-500/30 mb-4" />
                  <p className="text-gray-500 text-sm">История раскладов пуста.</p>
                  <p className="text-gray-600 text-xs mt-1">Воспользуйтесь любым модулем, чтобы сохранить результат.</p>
                  <button onClick={() => router.push("/")}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all cursor-pointer text-sm">
                    Перейти к модулям →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {readings.map(r => <ReadingCard key={r.id} reading={r} />)}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
              <div className="space-y-4">
                {/* Name */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Имя</p>
                  <EditableField
                    label="Ваше имя"
                    value={profile?.full_name ?? ""}
                    onSave={v => updateProfile({ full_name: v })}
                  />
                </div>

                {/* Birth date */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />Дата рождения
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      defaultValue={profile?.birth_date ?? ""}
                      onBlur={async e => {
                        if (e.target.value !== (profile?.birth_date ?? "")) {
                          await updateProfile({ birth_date: e.target.value || null });
                        }
                      }}
                      className="flex-1 bg-white/[0.05] border border-purple-500/20 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Subscription */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />Подписка
                  </p>
                  {subscribed ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                          <span className="text-sm text-white font-medium">Premium</span>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                          Активна
                        </span>
                      </div>
                      {profile?.subscribed_until && (
                        <div className="flex items-center justify-between text-xs border-t border-purple-500/10 pt-3">
                          <span className="text-gray-500">Действует до</span>
                          <span className="text-gray-300">{formatDate(profile.subscribed_until)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                          <span className="text-sm text-gray-400">Бесплатный план</span>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
                          Free
                        </span>
                      </div>
                      <button
                        onClick={() => router.push("/")}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-300 hover:bg-purple-600/25 transition-all cursor-pointer text-sm"
                      >
                        <Sparkles className="w-4 h-4" />
                        Перейти на Premium
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-300">{email}</p>
                </div>

                {/* Member since */}
                {profile?.created_at && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/15">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Участник с</p>
                    <p className="text-sm text-gray-300">{formatDate(profile.created_at)}</p>
                  </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-sm mt-2">
                  <LogOut className="w-4 h-4" />
                  Выйти из аккаунта
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
