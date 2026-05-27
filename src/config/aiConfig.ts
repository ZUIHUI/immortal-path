export const AI_CONFIG = {
  narrativeModel: "gpt-4.1-nano",
  maxRecentLogs: 5,
  maxChoices: 2,
  maxSuggestedEffects: 3,
  maxContentChars: 180,
  fallbackToStaticEvents: true,
  schemaRetryCount: 0,
  maxOutputTokens: 750,
  temperature: 0.55,
  requestTimeoutMs: 28_000,
  openAiRequestTimeoutMs: 24_000,
  dailyUsageLimit: 40,
};

export const NARRATIVE_USAGE_STORAGE_KEY = "ai-narrative-usage-v2";
