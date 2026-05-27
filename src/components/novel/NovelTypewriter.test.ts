import { describe, expect, it } from "vitest";
import type { NovelStoryBlock } from "../../types";
import { flattenNovelLines, getFirstAnimatedLineIndex } from "./NovelTypewriter";

function block(id: string, title: string, lines: string[]): NovelStoryBlock {
  return {
    id,
    chapterTitle: title,
    storyText: lines.join("\n"),
    displayLines: lines,
    sceneType: "continue",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("NovelTypewriter helpers", () => {
  it("keeps previous blocks complete and starts animation at the active block", () => {
    const blocks = [
      block("scene_001", "第一章", ["舊段第一行", "舊段第二行"]),
      block("scene_002", "第二章", ["新段第一行", "新段第二行"]),
    ];

    const lines = flattenNovelLines(blocks);
    const startIndex = getFirstAnimatedLineIndex(blocks, "scene_002");

    expect(lines.slice(0, startIndex).map((line) => line.blockId)).toEqual([
      "scene_001",
      "scene_001",
      "scene_001",
    ]);
    expect(lines[startIndex]?.key).toBe("scene_002-title");
  });

  it("returns -1 when no active block is provided", () => {
    expect(getFirstAnimatedLineIndex([block("scene_001", "第一章", ["正文"])], null)).toBe(-1);
  });
});
