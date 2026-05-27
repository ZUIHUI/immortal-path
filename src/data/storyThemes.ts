import type { StoryTheme } from "../types";

export const storyThemes: StoryTheme[] = [
  {
    id: "story_theme_orthodox_sect",
    category: "正統修仙",
    name: "宗門試煉與山門暗流",
    prompts: ["宗門收徒", "外門爭鬥", "洞府修煉", "秘境試煉", "同門背叛", "長老考驗"],
    antiClicheTwist: "宗門規矩表面古板，實際上藏著前世輪迴者留下的漏洞。",
  },
  {
    id: "story_theme_mortal_counterattack",
    category: "凡人逆襲",
    name: "低劣根骨反殺命盤",
    prompts: ["凡骨被嘲笑", "靈根低劣", "雜役崛起", "靠心性破局", "以弱勝強"],
    antiClicheTwist: "被嘲笑的低劣根骨不是缺陷，而是能容納異世界規則的空位。",
  },
  {
    id: "story_theme_infinite_instance",
    category: "無限流副本",
    name: "倒數世界與輪迴者競爭",
    prompts: ["突然被拉入秘境世界", "世界規則改變", "倒數死亡任務", "多名輪迴者同場競爭"],
    antiClicheTwist: "通關條件不是完成任務，而是發現任務本身在欺騙輪迴者。",
  },
  {
    id: "story_theme_weird_cultivation",
    category: "詭異修行",
    name: "香火有毒與名字污染",
    prompts: ["神像睜眼", "宗門弟子每天忘記一件事", "修為越高越不像人", "天道會吃掉名字"],
    antiClicheTwist: "詭異不是敵人，而是被上一批飛升者丟下的修行副作用。",
  },
  {
    id: "story_theme_time_reincarnation",
    category: "時間 / 輪迴",
    name: "前世警告與錯位死亡",
    prompts: ["同一天重複發生", "收到前世留下的警告", "看見未來死亡場景", "NPC 記得你上一世"],
    antiClicheTwist: "警告不一定要避免，某些死亡必須按順序發生才會打開下一條路。",
  },
  {
    id: "story_theme_causality_choice",
    category: "因果抉擇",
    name: "善惡延遲回收",
    prompts: ["救一人會害百人", "奪一寶可成道", "善念未必有善果", "因果在下一世回收"],
    antiClicheTwist: "選項的好壞不在此世揭曉，而是在下一世變成開局祝福或詛咒。",
  },
  {
    id: "story_theme_destiny_defiance",
    category: "天命 / 逆天",
    name: "不該存在的人",
    prompts: ["天道降下試煉", "命格被篡改", "天命榜出現你的名字", "世界意志試圖抹除你"],
    antiClicheTwist: "天道不是絕對秩序，而是某個古老失敗者寫下的防錯程序。",
  },
  {
    id: "story_theme_bond",
    category: "情感與羈絆",
    name: "跨世恩仇",
    prompts: ["師兄弟情義", "與未來敵人結伴", "師父隱瞞真相", "恩人其實是前世仇敵"],
    antiClicheTwist: "真正的羈絆不是幫你活下來，而是逼你做出不能重來的選擇。",
  },
  {
    id: "story_theme_dark_choice",
    category: "黑暗抉擇",
    name: "用人性換突破",
    prompts: ["奪舍", "獻祭", "魔功誘惑", "以壽元換修為", "保留前世記憶但失去情感"],
    antiClicheTwist: "黑暗選項不一定立刻懲罰，可能會成為未來最溫柔的代價。",
  },
  {
    id: "story_theme_wild_encounter",
    category: "腦洞奇遇",
    name: "被功法收為弟子",
    prompts: ["會說話的丹藥", "山門只在雨夜出現", "名字出現在三百年後墓碑", "靈氣有自己的意識"],
    antiClicheTwist: "奇遇主體必須擁有自己的目的，不只是給玩家送道具。",
  },
  {
    id: "story_theme_modern_anomaly",
    category: "現代異常",
    name: "城市裡的靈界站台",
    prompts: ["電梯停在不存在的樓層", "手機收到前世簡訊", "地鐵末班車駛入靈界站台", "官方管理局封鎖現場"],
    antiClicheTwist: "現代異常必須與社群、監控、城市規則產生衝突。",
  },
  {
    id: "story_theme_future_cultivation",
    category: "未來科技修行",
    name: "天道防火牆與元神備份",
    prompts: ["丹田核心被非法改造", "功法變成插件", "神識接入黑市伺服器", "仙道機甲拒絕承認你"],
    antiClicheTwist: "科技不是裝飾，而是天道用來限制修行者的另一種戒律。",
  },
];

export function pickStoryThemes(random = Math.random, count = 2): StoryTheme[] {
  const shuffled = [...storyThemes].sort(() => random() - 0.5);
  return shuffled.slice(0, Math.max(1, Math.min(count, shuffled.length)));
}
