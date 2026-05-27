import type { AiNovelChoice, AiNovelScene } from "../types";

export interface NoveltyResult {
  score: number;
  reasons: string[];
  shouldRegenerate: boolean;
}

const staleMotifs = [
  "採藥",
  "采藥",
  "殘卷",
  "老者",
  "山洞",
  "靈泉",
  "宗門打壓",
  "普通突破",
  "心魔",
  "撿到功法",
  "神秘老人",
];

const twistMotifs = [
  "時間錯位",
  "輪迴記憶",
  "前世",
  "世界規則",
  "身份反轉",
  "記得你",
  "遺物",
  "因果代價",
  "道德困境",
  "詭異",
  "天道",
  "今生",
  "科技",
  "AI",
  "系統",
  "下一世",
  "名字",
  "影子",
  "錯誤碼",
  "站台",
  "防火牆",
  "夢",
  "不存在",
  "告示",
  "裂縫",
  "代價",
];

const genericChoiceWords = ["接受", "拒絕", "攻擊", "離開", "查看", "調查", "前進", "等待"];

function countMatches(text: string, words: string[]): number {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function countGenericChoices(choices: AiNovelChoice[] = []): number {
  return choices.filter((choice) =>
    genericChoiceWords.some(
      (word) => choice.text.trim() === word || choice.text.trim().startsWith(`${word}。`),
    ),
  ).length;
}

export function calculateNoveltyScore(
  scene: Pick<AiNovelScene, "storyText" | "chapterTitle" | "noveltyHints"> &
    Partial<Pick<AiNovelScene, "choices">>,
  recentStoryContext: string[] = [],
): NoveltyResult {
  const text = `${scene.chapterTitle}\n${scene.storyText}\n${scene.choices?.map((choice) => choice.text).join(" ") ?? ""}\n${scene.noveltyHints.join(" ")}`;
  const staleCount = countMatches(text, staleMotifs);
  const twistCount = countMatches(text, twistMotifs);
  const repeatedContextCount = recentStoryContext
    .filter((item) => item && item.length >= 2 && text.includes(item))
    .slice(0, 8).length;
  const genericChoiceCount = countGenericChoices(scene.choices);
  const hasExplicitTwist = /不是|卻|竟|反而|原來|其實|未曾|不存在|三百年|上一世|下一世|早已|替你|另一個你/.test(text);
  const hasDilemma = /救|殺|放棄|代價|犧牲|賭|承認|抹除|吞噬|歸還|奪取|背叛|立誓|欺瞞/.test(text);
  const hasEnglishNoise = /\b(unknown|undefined|status|risk|debug|prompt|json|system)\b/i.test(text);
  const lengthBonus = scene.storyText.length >= 500 ? 10 : scene.storyText.length >= 280 ? 4 : -8;

  let score =
    52 +
    twistCount * 5 -
    staleCount * 9 -
    repeatedContextCount * 7 -
    genericChoiceCount * 9 +
    lengthBonus;
  const reasons: string[] = [];

  if (staleCount > 0) reasons.push(`含有 ${staleCount} 個常見套路元素`);
  if (twistCount > 0) reasons.push(`含有 ${twistCount} 個反套路或跨世界元素`);
  if (genericChoiceCount > 0) reasons.push(`有 ${genericChoiceCount} 個選項太像功能按鈕`);
  if (hasExplicitTwist) {
    score += 10;
    reasons.push("有明確反轉語氣");
  }
  if (hasDilemma) {
    score += 8;
    reasons.push("抉擇具備代價或道德張力");
  }
  if (hasEnglishNoise) {
    score -= 22;
    reasons.push("含有出戲英文介面詞");
  }
  if (repeatedContextCount > 0) reasons.push("與近期劇情語彙重疊偏高");

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    reasons: reasons.length ? reasons : ["劇情具備基本變化"],
    shouldRegenerate: score < 66,
  };
}
