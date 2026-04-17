"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const displayName =
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Профиль";
        setName(displayName);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (name) {
    return (
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-300 hover:bg-purple-600/25 transition-all cursor-pointer text-sm"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline max-w-[100px] truncate">{name}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/auth/login")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-300 hover:bg-purple-600/25 transition-all cursor-pointer text-sm"
    >
      <User className="w-4 h-4" />
      <span className="hidden sm:inline">Войти</span>
    </button>
  );
}
