export const AI_CONFIG = {
  narrativeModel: "gpt-4.1-nano",
  maxRecentLogs: 3,
  maxChoices: 2,
  maxSuggestedEffects: 2,
  maxContentChars: 150,
  fallbackToStaticEvents: true,
  schemaRetryCount: 0,
  maxOutputTokens: 520,
  temperature: 0.5,
  requestTimeoutMs: 24_000,
  openAiRequestTimeoutMs: 20_000,
  dailyUsageLimit: 40,
};

export const NARRATIVE_USAGE_STORAGE_KEY = "ai-narrative-usage-v2";
