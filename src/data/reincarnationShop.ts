import type { ReincarnationShopItem } from "../types";

export const reincarnationShopItems: ReincarnationShopItem[] = [
  {
    id: "initial_comprehension",
    name: "初始悟性提升",
    description: "每級讓下一世開局悟性 +3，並透過悟性提高頓悟機率。",
    baseCost: 10,
    costMultiplier: 1.55,
    maxLevel: 10,
    effectKey: "initialComprehension",
    effectPerLevel: 3,
    balanceNote: "提升頓悟、修煉收益與部分事件選擇，前期很有感。",
  },
  {
    id: "initial_luck",
    name: "初始福緣提升",
    description: "每級讓下一世開局福緣 +3，並提高稀有事件與奇遇爆發機率。",
    baseCost: 10,
    costMultiplier: 1.55,
    maxLevel: 10,
    effectKey: "initialLuck",
    effectPerLevel: 3,
    balanceNote: "提高稀有事件與頓悟機率，讓下一世更常出驚喜。",
  },
  {
    id: "cultivation_efficiency",
    name: "修煉效率提升",
    description: "每級提高 10% 修煉獲得修為的效率。",
    baseCost: 12,
    costMultiplier: 1.65,
    maxLevel: 10,
    effectKey: "cultivationEfficiency",
    effectPerLevel: 0.1,
    balanceNote: "每級都會明顯加速前期境界推進。",
  },
  {
    id: "breakthrough_rate",
    name: "突破成功率提升",
    description: "每級提供 5% 永久突破成功率。",
    baseCost: 14,
    costMultiplier: 1.7,
    maxLevel: 8,
    effectKey: "breakthroughRate",
    effectPerLevel: 0.05,
    balanceNote: "能立刻感覺突破更穩，但逆天突破仍有風險。",
  },
  {
    id: "initial_lifespan",
    name: "增加初始壽元",
    description: "每級增加下一世初始壽元 10 年，給玩家更多衝境界空間。",
    baseCost: 12,
    costMultiplier: 1.6,
    maxLevel: 10,
    effectKey: "initialLifespan",
    effectPerLevel: 10,
    balanceNote: "提高容錯，也讓第一世後的推進時間更充裕。",
  },
];

export function getShopItemById(itemId: string): ReincarnationShopItem {
  const item = reincarnationShopItems.find((shopItem) => shopItem.id === itemId);

  if (!item) {
    throw new Error(`Shop item not found: ${itemId}`);
  }

  return item;
}
