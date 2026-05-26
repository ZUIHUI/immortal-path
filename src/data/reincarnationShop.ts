import type { ReincarnationShopItem } from "../types";

export const reincarnationShopItems: ReincarnationShopItem[] = [
  {
    id: "initial_comprehension",
    name: "初始悟性提升",
    description: "每級讓下一世開局悟性提高，修煉與部分事件選擇更穩。",
    baseCost: 6,
    costMultiplier: 1.45,
    maxLevel: 10,
    effectKey: "initialComprehension",
    effectPerLevel: 2,
    balanceNote: "提升理解力，但不直接保證突破成功。",
  },
  {
    id: "initial_luck",
    name: "初始福緣提升",
    description: "每級提高下一世福緣，增加奇遇收益與事件成功微幅加成。",
    baseCost: 6,
    costMultiplier: 1.45,
    maxLevel: 10,
    effectKey: "initialLuck",
    effectPerLevel: 2,
    balanceNote: "主要改善事件體驗，避免過快推高境界。",
  },
  {
    id: "cultivation_efficiency",
    name: "修煉效率提升",
    description: "每級提高修煉獲得修為的效率。",
    baseCost: 8,
    costMultiplier: 1.55,
    maxLevel: 8,
    effectKey: "cultivationEfficiency",
    effectPerLevel: 0.04,
    balanceNote: "長線最強項目，成本成長較快。",
  },
  {
    id: "breakthrough_rate",
    name: "突破成功率提升",
    description: "每級提供小幅永久突破成功率。",
    baseCost: 10,
    costMultiplier: 1.6,
    maxLevel: 8,
    effectKey: "breakthroughRate",
    effectPerLevel: 0.015,
    balanceNote: "加成幅度保守，避免突破完全無風險。",
  },
  {
    id: "initial_lifespan",
    name: "增加初始壽元",
    description: "每級增加下一世初始壽元，給玩家更多嘗試空間。",
    baseCost: 7,
    costMultiplier: 1.5,
    maxLevel: 10,
    effectKey: "initialLifespan",
    effectPerLevel: 3,
    balanceNote: "提高容錯，不直接增加輸出。",
  },
];

export function getShopItemById(itemId: string): ReincarnationShopItem {
  const item = reincarnationShopItems.find((shopItem) => shopItem.id === itemId);

  if (!item) {
    throw new Error(`Shop item not found: ${itemId}`);
  }

  return item;
}
