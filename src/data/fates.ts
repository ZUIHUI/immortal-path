import type { Fate } from "../types";

export const fates: Fate[] = [
  {
    id: "deep_fortune",
    name: "福緣深厚",
    description: "冥冥中常有一線生機，奇遇更容易靠近你。",
    effects: {
      luck: 8,
      eventChanceBonus: 0.08,
      resourceGainBonus: 0.06,
    },
    advantages: ["奇遇機率提升", "事件收益略高"],
    costs: ["直接突破加成較少"],
    suitableIdentityIds: ["village_orphan", "loose_cultivator_child"],
    upgradable: true,
    isMvp: true,
  },
  {
    id: "past_wisdom",
    name: "前世宿慧",
    description: "前世碎片偶爾浮現，使你更快理解功法與選擇。",
    effects: {
      comprehension: 8,
      cultivationEfficiencyBonus: 0.05,
    },
    advantages: ["悟性高", "修煉效率提升"],
    costs: ["心魔事件略有機會出現"],
    suitableIdentityIds: ["fallen_clan_heir", "outer_disciple"],
    upgradable: true,
    isMvp: true,
  },
  {
    id: "ordinary_bones",
    name: "凡骨不凡",
    description: "根骨平平，卻能在每一次突破後打磨出厚重根基。",
    effects: {
      maxHp: 10,
      daoHeart: 4,
    },
    advantages: ["生存力高", "突破後收益穩"],
    costs: ["前期修煉速度普通"],
    suitableIdentityIds: ["village_orphan", "five_root_mortal"],
    upgradable: true,
    isMvp: true,
  },
  {
    id: "short_lived",
    name: "短命之相",
    description: "壽元先天不足，卻因時日無多而破釜沉舟。",
    effects: {
      lifespan: -18,
      breakthroughRateBonus: 0.08,
      cultivationEfficiencyBonus: 0.04,
    },
    advantages: ["突破成功率高", "修煉更專注"],
    costs: ["初始壽元明顯降低"],
    suitableIdentityIds: ["outer_disciple", "fallen_clan_heir"],
    upgradable: true,
    isMvp: true,
  },
  {
    id: "natural_dao_body",
    name: "天生道體",
    description: "身合靈機，修行如呼吸，但天道注視也更早降臨。",
    effects: {
      spiritualRoot: 14,
      comprehension: 6,
      cultivationEfficiencyBonus: 0.14,
      deathRiskMultiplier: 1.08,
    },
    advantages: ["修煉效率很高", "悟性與靈根俱佳"],
    costs: ["突破與事件的風險略高"],
    suitableIdentityIds: ["outer_disciple", "heavenly_root_genius"],
    upgradable: true,
    isMvp: true,
  },
];

export function getFateById(fateId: string): Fate {
  const fate = fates.find((item) => item.id === fateId);

  if (!fate) {
    throw new Error(`Fate not found: ${fateId}`);
  }

  return fate;
}
