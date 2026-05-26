export const AI_CONFIG = {
  narrativeModel: "gpt-4o-mini",
  maxRecentLogs: 5,
  maxChoices: 4,
  maxSuggestedEffects: 6,
  maxContentChars: 320,
  fallbackToStaticEvents: true,
  schemaRetryCount: 0,
  maxOutputTokens: 850,
  temperature: 0.72,
  requestTimeoutMs: 34_000,
  dailyUsageLimit: 40,
};

export const NARRATIVE_USAGE_STORAGE_KEY = "ai-narrative-usage-v2";
