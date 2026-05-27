import type { LifeTheme, WorldType } from "../types";

export const lifeThemes: LifeTheme[] = [
  {
    id: "life_theme_mortal_bone_defies_immortal",
    name: "凡骨逆仙",
    description: "此世起點低微，但每一次被否定都會變成逆命的燃料。",
    motifs: ["凡骨", "嘲笑", "逆命", "低階反殺"],
    escalationBeats: ["資質被測出低劣", "靠抉擇得到異常機緣", "以凡骨承受不該承受的道基"],
    finalChoiceHints: ["承認凡骨", "奪取天資", "斬斷評判你的命盤"],
    compatibleWorldTypes: ["ancient_xianxia", "high_martial", "modern_reiki", "mixed_realm"],
  },
  {
    id: "life_theme_demonic_thought_wakes",
    name: "魔念初醒",
    description: "神魂深處有一道不屬於此世的聲音，既能救你，也可能成為你。",
    motifs: ["魔念", "低語", "黑色靈光", "交換"],
    escalationBeats: ["魔念給出正確提醒", "魔念要求第一個代價", "魔念開始替你做決定"],
    finalChoiceHints: ["吞下魔念", "與魔念立約", "承認魔念也是前世的你"],
    compatibleWorldTypes: ["ancient_xianxia", "dream_realm", "cosmic_horror", "weird_city"],
  },
  {
    id: "life_theme_causality_misaligned",
    name: "因果錯位",
    description: "此世的因果順序被打亂，結果可能先於選擇到來。",
    motifs: ["錯位因果", "提前發生的報應", "陌生恩情", "延遲清算"],
    escalationBeats: ["先收到未來代價", "NPC 因未發生的事恨你", "下一世因果提前干涉此世"],
    finalChoiceHints: ["補上因果", "賴掉因果", "把因果轉嫁給未來的自己"],
    compatibleWorldTypes: ["time_loop", "parallel_world", "modern_reiki", "ancient_xianxia"],
  },
  {
    id: "life_theme_destiny_thief",
    name: "天命竊賊",
    description: "你此世的每一次變強，都像是在偷走本屬於他人的命數。",
    motifs: ["天命榜", "竊命", "金色裂痕", "被注視"],
    escalationBeats: ["名字出現在天命榜邊角", "真正天命之子開始衰弱", "世界意志試圖追回命數"],
    finalChoiceHints: ["歸還天命", "徹底奪命", "把天命分給不該活下來的人"],
    compatibleWorldTypes: ["ancient_xianxia", "ai_heaven", "future_stellar", "mixed_realm"],
  },
  {
    id: "life_theme_shadow_ascends_first",
    name: "影子先成仙",
    description: "你的影子比你更早開始修煉，並逐漸擁有自己的道途。",
    motifs: ["影子吐納", "月光", "借影成道", "無影"],
    escalationBeats: ["影子自行動作", "旁人看見影子境界更高", "影子替你擋下一劫並索要自由"],
    finalChoiceHints: ["吞噬影子", "放影子自由", "與影子共築道基"],
    compatibleWorldTypes: ["weird_city", "ancient_xianxia", "dream_realm"],
  },
  {
    id: "life_theme_ai_heaven_rejects_you",
    name: "AI 天道判定你不該存在",
    description: "某個維持世界秩序的天道系統，把你的輪迴資料標成錯誤。",
    motifs: ["錯誤碼", "天道審查", "資料抹除", "非法神魂"],
    escalationBeats: ["身份資料對不上", "天道防火牆追蹤突破", "系統開始改寫身邊人的記憶"],
    finalChoiceHints: ["修補自己", "感染天道", "讓錯誤變成新規則"],
    compatibleWorldTypes: ["cyber_cultivation", "future_stellar", "ai_heaven", "modern_reiki"],
  },
  {
    id: "life_theme_world_already_dead",
    name: "世界其實已經死了",
    description: "此世的一切生機都像是死後殘響，越接近真相越難活著離開。",
    motifs: ["死後世界", "空殼飛升者", "殘響", "世界火種"],
    escalationBeats: ["活人表現出死者習慣", "飛升者只剩空殼", "世界要求你帶走最後一點火"],
    finalChoiceHints: ["帶走火種", "陪世界死去", "用自己當新火種"],
    compatibleWorldTypes: ["apocalypse", "dream_realm", "cosmic_horror", "ancient_xianxia"],
  },
  {
    id: "life_theme_future_downloads_past_art",
    name: "你在未來世界下載了前世功法",
    description: "前世功法被改寫成資料插件，但每次運行都會喚醒一段死因。",
    motifs: ["功法插件", "前世封包", "非法核心", "死因回放"],
    escalationBeats: ["插件識別你為原作者", "死因片段干擾現實", "功法要求上傳神魂備份"],
    finalChoiceHints: ["覆寫功法", "刪除死因", "把前世記憶公開到神識網路"],
    compatibleWorldTypes: ["cyber_cultivation", "future_stellar", "ai_heaven"],
  },
];

export function getLifeThemeById(themeId: string | undefined): LifeTheme | undefined {
  return lifeThemes.find((theme) => theme.id === themeId);
}

export function getLifeThemesForWorldType(worldType: WorldType): LifeTheme[] {
  const matched = lifeThemes.filter((theme) =>
    theme.compatibleWorldTypes.includes(worldType) || theme.compatibleWorldTypes.includes("mixed_realm"),
  );

  return matched.length > 0 ? matched : lifeThemes;
}
