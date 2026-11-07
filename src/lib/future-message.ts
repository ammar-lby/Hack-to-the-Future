import { FUTURE_MESSAGE_WEBHOOK_URL } from "@/config";
import type { ForecastRisk } from "@/lib/forecast";
import type { OutlookData } from "@/lib/outlook-data";
import type { Lang } from "@/i18n/translations";

export function futureMessagePayload(risk: ForecastRisk, language: Lang, persona: OutlookData["persona"]) {
  return { risk: { week: risk.week, shortfall: risk.shortfall, reason: risk.reason, fix: risk.fix }, language, persona: { name: persona.name, language, homeCurrency: persona.homeCurrency } };
}

export async function prepareFutureMessage(risk: ForecastRisk, language: Lang, persona: OutlookData["persona"], signal: AbortSignal) {
  if (!FUTURE_MESSAGE_WEBHOOK_URL) throw new Error("Message service not configured");
  const response = await fetch(FUTURE_MESSAGE_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(futureMessagePayload(risk, language, persona)), signal });
  if (!response.ok) throw new Error(`Message ${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("text" in result) || !("audio" in result) || typeof result.text !== "string" || typeof result.audio !== "string" || !result.text.trim() || !result.audio.trim()) throw new Error("Incomplete message");
  return { text: result.text, audio: result.audio };
}

export type RiskAction = "setAside" | "insuranceReminder";
export function saveRiskAction(risk: ForecastRisk, action: RiskAction) {
  const key = `futureyou.riskAction.${risk.week}.${action}`;
  const value = { week: risk.week, action, amount: action === "setAside" ? risk.saveWeekly : null, weeks: action === "setAside" ? risk.weeksUntil : null };
  window.localStorage.setItem(key, JSON.stringify(value));
}
export function hasRiskAction(risk: ForecastRisk, action: RiskAction) {
  return window.localStorage.getItem(`futureyou.riskAction.${risk.week}.${action}`) !== null;
}
export function saveCoachRisk(risk: ForecastRisk) { window.localStorage.setItem("futureyou.coachRisk", JSON.stringify(risk)); }