const PREFIX = "astral_usage_";
const SUB_KEY = "astral_subscribed";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function isSubscribed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SUB_KEY) === "true";
}

export function subscribe(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUB_KEY, "true");
}

export function canUseModule(module: string): boolean {
  if (typeof window === "undefined") return true;
  if (isSubscribed()) return true;
  return !localStorage.getItem(`${PREFIX}${module}_${today()}`);
}

export function markModuleUsed(module: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}${module}_${today()}`, "1");
}
