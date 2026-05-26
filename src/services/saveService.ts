import { SAVE_KEY, SAVE_VERSION } from "../constants/game";
import type { SaveData } from "../types";

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export interface SaveResult {
  ok: boolean;
  compacted: boolean;
  error?: unknown;
}

function getDefaultStorage(): StorageLike | undefined {
  if (typeof window === "undefined" || !window.localStorage) {
    return undefined;
  }

  return window.localStorage;
}

function compactSaveData(data: SaveData): SaveData {
  return {
    ...data,
    logs: data.logs.slice(0, 30),
    meta: {
      ...data.meta,
      history: data.meta.history.slice(0, 5),
    },
    currentEvent: undefined,
  };
}

export function createSaveService(storageProvider = getDefaultStorage) {
  return {
    load(): SaveData | undefined {
      const storage = storageProvider();

      if (!storage) {
        return undefined;
      }

      const raw = storage.getItem(SAVE_KEY);

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

    save(data: SaveData): SaveResult {
      const storage = storageProvider();

      if (!storage) {
        return {
          ok: false,
          compacted: false,
          error: "storage_unavailable",
        };
      }

      const payload = {
        ...data,
        savedAt: new Date().toISOString(),
      };

      try {
        storage.setItem(SAVE_KEY, JSON.stringify(payload));
        return {
          ok: true,
          compacted: false,
        };
      } catch (error) {
        const compacted = compactSaveData(payload);

        try {
          storage.setItem(SAVE_KEY, JSON.stringify(compacted));
          return {
            ok: true,
            compacted: true,
          };
        } catch (retryError) {
          return {
            ok: false,
            compacted: true,
            error: retryError,
          };
        }
      }
    },

    clear(): void {
      const storage = storageProvider();

      if (!storage) {
        return;
      }

      storage.removeItem(SAVE_KEY);
    },
  };
}

export const saveService = createSaveService();
