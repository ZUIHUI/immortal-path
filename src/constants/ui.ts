import type { ResourceMap, ReincarnationShopEffectKey } from "../types";

export const resourceVisuals: Record<
  keyof ResourceMap | "reincarnationPoints",
  { icon: string; label: string; tone: string }
> = {
  spiritStones: { icon: "石", label: "靈石", tone: "cyan" },
  aura: { icon: "氣", label: "靈氣", tone: "teal" },
  pills: { icon: "丹", label: "丹藥", tone: "gold" },
  herbs: { icon: "草", label: "靈草", tone: "green" },
  artifacts: { icon: "器", label: "法器", tone: "purple" },
  destiny: { icon: "命", label: "天命值", tone: "gold" },
  karma: { icon: "因", label: "因果值", tone: "rose" },
  pastLifeMemory: { icon: "憶", label: "前世記憶", tone: "purple" },
  reincarnationPoints: { icon: "輪", label: "輪迴點", tone: "gold" },
};

export const shopEffectVisuals: Record<
  ReincarnationShopEffectKey,
  { icon: string; tone: string }
> = {
  initialComprehension: { icon: "悟", tone: "cyan" },
  initialLuck: { icon: "福", tone: "gold" },
  cultivationEfficiency: { icon: "修", tone: "teal" },
  breakthroughRate: { icon: "破", tone: "purple" },
  initialLifespan: { icon: "壽", tone: "green" },
};
