import {
  AI_CONFIG,
  NARRATIVE_USAGE_STORAGE_KEY,
} from "../config/aiConfig";
import { parseAiNarrativeResponse } from "./narrativeSchema";
import type {
  AiNarrativeResponse,
  ContinueNarrativeScenePayload,
  GenerateNarrativeScenePayload,
} from "../types";

interface UsageRecord {
  date: string;
  count: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function getNarrativeApiUsage(): UsageRecord {
  const storage = getStorage();
  const fallback = { date: todayKey(), count: 0 };

  if (!storage) return fallback;

  try {
    const parsed = JSON.parse(
      storage.getItem(NARRATIVE_USAGE_STORAGE_KEY) ?? "null",
    ) as UsageRecord | null;

    if (!parsed || parsed.date !== todayKey()) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}

export function canUseNarrativeApi(): boolean {
  return getNarrativeApiUsage().count < AI_CONFIG.dailyUsageLimit;
}

export function incrementNarrativeApiUsage(): void {
  const storage = getStorage();

  if (!storage) return;

  const usage = getNarrativeApiUsage();
  storage.setItem(
    NARRATIVE_USAGE_STORAGE_KEY,
    JSON.stringify({
      date: todayKey(),
      count: usage.count + 1,
    }),
  );
}

async function postNarrative<TPayload>(
  url: string,
  payload: TPayload,
): Promise<AiNarrativeResponse> {
  if (!canUseNarrativeApi()) {
    throw new Error("今日天機推演次數已達上限");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    AI_CONFIG.requestTimeoutMs,
  );

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => "");
      let message = responseText.slice(0, 240);

      try {
        const errorPayload = JSON.parse(responseText) as { error?: string };
        message = errorPayload.error ?? message;
      } catch {
        // Non-JSON responses are useful for diagnosing missing Vercel routes.
      }

      throw new Error(
        `AI narrative API failed (${response.status} ${response.statusText}): ${
          message || "empty response"
        }`,
      );
    }

    const parsed = parseAiNarrativeResponse(await response.json());
    incrementNarrativeApiUsage();
    return parsed;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function generateNarrativeScene(
  payload: GenerateNarrativeScenePayload,
): Promise<AiNarrativeResponse> {
  return postNarrative("/api/narrative/generate", payload);
}

export function continueNarrativeScene(
  payload: ContinueNarrativeScenePayload,
): Promise<AiNarrativeResponse> {
  return postNarrative("/api/narrative/continue", payload);
}
