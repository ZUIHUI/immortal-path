import { fates } from "./fates";
import { identities } from "./identities";
import { getLifeThemesForWorldType } from "./lifeThemes";
import { worlds } from "./worlds";
import type {
  FateId,
  IdentityId,
  InfiniteStoryPremise,
  LifeTheme,
  MetaProgress,
  WorldId,
} from "../types";

export const infiniteStoryPremises: InfiniteStoryPremise[] = [
  {
    id: "premise_falling_star",
    title: "墜星入魂",
    openingText:
      "你只記得一道星光砸入眉心，再睜眼時，已躺在青雲山腳的荒草間。袖中多了一枚無字玉符，似乎正在替你吞吐靈氣。",
    tone: "星河、玉符、未知召喚",
    surpriseHook: "無字玉符會在關鍵時刻浮現前世字跡。",
  },
  {
    id: "premise_coffin_wake",
    title: "棺中醒世",
    openingText:
      "你從一口薄棺中醒來，棺外是送葬隊驚恐的呼聲。胸口那枚裂開的銅錢正在發燙，像是替你擋過一次死劫。",
    tone: "死而復生、因果銅錢、村野驚疑",
    surpriseHook: "銅錢每次發燙，都代表某段死亡因果正在靠近。",
  },
  {
    id: "premise_outer_sect_swap",
    title: "外門替身",
    openingText:
      "你醒在青雲外門柴房，身旁有一套不合身的弟子服與一封燒了一半的求救信。有人把你當成另一個人送進了宗門。",
    tone: "身份錯置、宗門暗流、替身疑雲",
    surpriseHook: "真正的外門弟子失蹤前，似乎碰過輪迴命盤的碎片。",
  },
  {
    id: "premise_ancient_scroll",
    title: "古卷點名",
    openingText:
      "一卷從天而降的殘破古卷在你面前展開，上面沒有功法，只有你的名字與一行血字：此世若不築基，萬世皆空。",
    tone: "古卷、血字、命運逼迫",
    surpriseHook: "古卷會逐步揭露不同前世留下的失敗記錄。",
  },
  {
    id: "premise_river_memory",
    title: "輪迴河畔",
    openingText:
      "你似乎剛從一條黑色長河爬上岸，河水退去後，掌心留下淡淡金紋。每當你做出抉擇，金紋便會變換方向。",
    tone: "輪迴長河、掌心金紋、命運岔路",
    surpriseHook: "金紋會指向收益最高卻未必最安全的選擇。",
  },
];

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length) % items.length];
}

export function createInfiniteLifeSelection(
  meta: MetaProgress,
  random = Math.random,
): {
  name: string;
  worldId: WorldId;
  identityId: IdentityId;
  fateId: FateId;
  premise: InfiniteStoryPremise;
  lifeTheme: LifeTheme;
} {
  const availableWorlds = worlds.filter(
    (world) => world.isMvp && meta.unlockedWorldIds.includes(world.worldId),
  );
  const availableIdentities = identities.filter(
    (identity) => identity.isMvp && meta.unlockedIdentityIds.includes(identity.id),
  );
  const availableFates = fates.filter(
    (fate) => fate.isMvp && meta.unlockedFateIds.includes(fate.id),
  );

  const world = pick(availableWorlds, random);
  const themePool = getLifeThemesForWorldType(world.type);

  return {
    name: `第${meta.totalLives + 1}世異數`,
    worldId: world.worldId,
    identityId: pick(availableIdentities, random).id,
    fateId: pick(availableFates, random).id,
    premise: pick(infiniteStoryPremises, random),
    lifeTheme: pick(themePool, random),
  };
}

export function getInfiniteStoryPremise(
  premiseId: string | undefined,
): InfiniteStoryPremise | undefined {
  return infiniteStoryPremises.find((premise) => premise.id === premiseId);
}
