import v7 from "@/config/v7.json";

export const REALTIME_MODEL_OPTIONS = [
  {
    id: "gpt-realtime-2.1",
    label: "GPT-Realtime 2.1",
    shortLabel: "2.1 FULL",
    description: "Maximum director quality",
    badge: "DEFAULT",
  },
  {
    id: "gpt-realtime-2.1-mini",
    label: "GPT-Realtime 2.1 Mini",
    shortLabel: "2.1 MINI",
    description: "Faster and lower cost",
    badge: "FAST",
  },
] as const;

export type RealtimeModel = (typeof REALTIME_MODEL_OPTIONS)[number]["id"];

export function isRealtimeModel(value: unknown): value is RealtimeModel {
  return REALTIME_MODEL_OPTIONS.some((option) => option.id === value);
}

export const DEFAULT_REALTIME_MODEL: RealtimeModel = isRealtimeModel(v7.realtime.model)
  ? v7.realtime.model
  : "gpt-realtime-2.1";
