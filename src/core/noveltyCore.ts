import type { AiNovelScene } from "../types";

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
];

function countMatches(text: string, words: string[]): number {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

export function calculateNoveltyScore(
  scene: Pick<AiNovelScene, "storyText" | "chapterTitle" | "noveltyHints">,
  recentStoryContext: string[] = [],
): NoveltyResult {
  const text = `${scene.chapterTitle}\n${scene.storyText}\n${scene.noveltyHints.join(" ")}`;
  const staleCount = countMatches(text, staleMotifs);
  const twistCount = countMatches(text, twistMotifs);
  const repeatedContextCount = recentStoryContext.filter((item) => item && text.includes(item)).length;
  const hasExplicitTwist = /不是|卻|竟|反而|原來|其實|未曾|不存在|三百年|上一世|下一世/.test(text);
  const hasDilemma = /救|殺|放棄|代價|犧牲|賭|承認|抹除|吞噬|歸還|奪取/.test(text);
  const lengthBonus = scene.storyText.length >= 500 ? 10 : scene.storyText.length >= 280 ? 4 : -8;

  let score = 48 + twistCount * 8 - staleCount * 9 - repeatedContextCount * 6 + lengthBonus;
  const reasons: string[] = [];

  if (staleCount > 0) reasons.push(`含有 ${staleCount} 個常見套路元素`);
  if (twistCount > 0) reasons.push(`含有 ${twistCount} 個反套路或跨世界元素`);
  if (hasExplicitTwist) {
    score += 10;
    reasons.push("有明確反轉語氣");
  }
  if (hasDilemma) {
    score += 8;
    reasons.push("抉擇具備代價或道德張力");
  }
  if (repeatedContextCount > 0) reasons.push("與近期劇情語彙重疊偏高");

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    reasons: reasons.length ? reasons : ["劇情具備基本變化"],
    shouldRegenerate: score < 55,
  };
}
