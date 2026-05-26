import type { Identity } from "../types";

export const identities: Identity[] = [
  {
    id: "identity_orphan",
    name: "山村孤兒",
    description: "出身偏僻山村，沒有靠山，卻也少受因果牽扯。",
    initialAge: 14,
    statModifiers: {
      luck: 4,
      daoHeart: 2,
      cultivationEfficiencyBonus: 0.03,
    },
    initialResources: {
      spiritStones: 5,
      herbs: 2,
    },
    advantages: ["福緣略高", "因果較低", "事件風險較平穩"],
    disadvantages: ["初始資源少", "戰鬥能力較弱"],
    specialEventIds: ["event_qingyun_002"],
    playstyle: "穩健修煉，靠機緣補足資源。",
    unlockCondition: "初始可選",
    isMvp: true,
  },
  {
    id: "identity_outer_disciple",
    name: "宗門外門弟子",
    description: "已入青雲宗外門，有基本功法與任務來源。",
    initialAge: 16,
    statModifiers: {
      spiritualRoot: 5,
      comprehension: 2,
      cultivationEfficiencyBonus: 0.06,
      breakthroughRateBonus: 0.02,
    },
    initialResources: {
      spiritStones: 18,
      pills: 1,
    },
    advantages: ["修煉效率高", "突破略穩", "宗門事件收益較好"],
    disadvantages: ["宗門任務可能帶來戰鬥風險", "因果較高"],
    specialEventIds: ["event_qingyun_003"],
    playstyle: "快速修煉，利用宗門資源衝境界。",
    unlockCondition: "初始可選",
    isMvp: true,
  },
  {
    id: "identity_fallen_clan",
    name: "沒落世家子弟",
    description: "祖上曾有修士傳承，如今家道中落，只餘半卷殘法。",
    initialAge: 15,
    statModifiers: {
      comprehension: 5,
      divineSense: 2,
      daoHeart: 1,
      breakthroughRateBonus: 0.01,
    },
    initialResources: {
      spiritStones: 12,
      aura: 10,
      artifacts: 1,
    },
    advantages: ["悟性高", "起手資源平均", "更容易讀懂古卷事件"],
    disadvantages: ["氣血較弱", "家族舊怨可能引發風險"],
    specialEventIds: ["event_qingyun_004"],
    playstyle: "靠悟性與事件選擇拉開上限。",
    unlockCondition: "初始可選",
    isMvp: true,
  },
  {
    id: "identity_demonic_reborn",
    name: "魔修轉世",
    description: "前世魔念未散，修行迅猛，劫難也更重。",
    initialAge: 17,
    statModifiers: {
      attack: 8,
      cultivationEfficiencyBonus: 0.1,
      deathRiskMultiplier: 1.15,
    },
    initialResources: {
      karma: 8,
    },
    advantages: ["戰鬥強", "修行快"],
    disadvantages: ["事件風險高", "心魔更容易出現"],
    specialEventIds: [],
    playstyle: "高風險高收益。",
    unlockCondition: "未來以輪迴點解鎖",
    isMvp: false,
  },
  {
    id: "identity_heavenly_root_genius",
    name: "天靈根天才",
    description: "天賦驚人，易入宗門核心，也更容易招人嫉恨。",
    initialAge: 13,
    statModifiers: {
      spiritualRoot: 18,
      cultivationEfficiencyBonus: 0.18,
      luck: -2,
    },
    initialResources: {
      spiritStones: 30,
      pills: 2,
    },
    advantages: ["修煉極快", "起手資源高"],
    disadvantages: ["高階事件競爭激烈"],
    specialEventIds: [],
    playstyle: "衝境界。",
    unlockCondition: "未來解鎖",
    isMvp: false,
  },
  {
    id: "identity_five_root_mortal",
    name: "五靈根凡人",
    description: "資質駁雜，前期艱難，但根基厚重。",
    initialAge: 15,
    statModifiers: {
      spiritualRoot: -8,
      maxHp: 12,
      daoHeart: 4,
    },
    initialResources: {
      herbs: 4,
    },
    advantages: ["氣血好", "道心穩"],
    disadvantages: ["修煉慢"],
    specialEventIds: [],
    playstyle: "長線累積。",
    unlockCondition: "未來解鎖",
    isMvp: false,
  },
  {
    id: "identity_loose_cultivator_child",
    name: "散修之子",
    description: "家中長輩走過半條仙路，留下一點江湖經驗。",
    initialAge: 15,
    statModifiers: {
      luck: 2,
      defense: 3,
    },
    initialResources: {
      spiritStones: 15,
      herbs: 2,
    },
    advantages: ["探索穩定", "資源彈性高"],
    disadvantages: ["缺乏宗門庇護"],
    specialEventIds: [],
    playstyle: "事件與資源管理。",
    unlockCondition: "未來解鎖",
    isMvp: false,
  },
];

export function getIdentityById(identityId: string): Identity {
  const identity = identities.find((item) => item.id === identityId);

  if (!identity) {
    throw new Error(`Identity not found: ${identityId}`);
  }

  return identity;
}
