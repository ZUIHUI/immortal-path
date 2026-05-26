import { SAVE_KEY, SAVE_VERSION } from "../constants/game";
import type { SaveData } from "../types";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export const saveService = {
  load(): SaveData | undefined {
    if (!canUseStorage()) {
      return undefined;
    }

    const raw = window.localStorage.getItem(SAVE_KEY);

    if (!raw) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(raw) as SaveData;

      if (parsed.version !== SAVE_VERSION) {
        return undefined;
      }

      return parsed;
    } catch {
      return undefined;
    }
  },

  save(data: SaveData): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      }),
    );
  },

  clear(): void {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(SAVE_KEY);
  },
};
