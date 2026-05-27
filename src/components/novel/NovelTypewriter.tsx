import { useEffect, useMemo, useRef, useState } from "react";
import type { NovelStoryBlock } from "../../types";

export interface NovelTypewriterProps {
  blocks: NovelStoryBlock[];
  isTyping: boolean;
  activeBlockId?: string | null;
  charDelay?: number;
  lineDelay?: number;
  paragraphDelay?: number;
  canSkip?: boolean;
  onTypingDone?: () => void;
  onSkip?: () => void;
}

export function flattenNovelLines(blocks: NovelStoryBlock[]): Array<{
  key: string;
  blockId: string;
  chapterTitle?: string;
  text: string;
}> {
  return blocks.flatMap((block) => [
    { key: `${block.id}-title`, blockId: block.id, chapterTitle: block.chapterTitle, text: "" },
    ...block.displayLines.map((line, index) => ({
      key: `${block.id}-${index}`,
      blockId: block.id,
      text: line,
    })),
  ]);
}

export function getFirstAnimatedLineIndex(
  blocks: NovelStoryBlock[],
  activeBlockId: string | null | undefined,
): number {
  if (!activeBlockId) {
    return -1;
  }

  const lines = flattenNovelLines(blocks);
  return lines.findIndex((line) => line.key === `${activeBlockId}-title`);
}

export function NovelTypewriter({
  blocks,
  isTyping,
  activeBlockId,
  charDelay = 24,
  lineDelay = 320,
  paragraphDelay = 620,
  canSkip = true,
  onTypingDone,
  onSkip,
}: NovelTypewriterProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lines = useMemo(() => flattenNovelLines(blocks), [blocks]);
  const [visibleLineCount, setVisibleLineCount] = useState(lines.length);
  const [currentText, setCurrentText] = useState("");
  const activeLine = lines[Math.max(0, visibleLineCount - 1)];

  useEffect(() => {
    if (!isTyping || lines.length === 0) {
      setVisibleLineCount(lines.length);
      setCurrentText("");
      return;
    }

    const targetBlockId = activeBlockId ?? blocks[blocks.length - 1]?.id;
    const firstAnimatedIndex = lines.findIndex((line) => line.key === `${targetBlockId}-title`);
    const startIndex = firstAnimatedIndex >= 0 ? firstAnimatedIndex : Math.max(0, lines.length - 1);
    setVisibleLineCount(startIndex + 1);
    setCurrentText("");
  }, [activeBlockId, blocks, isTyping, lines]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleLineCount, currentText, lines.length]);

  useEffect(() => {
    if (!isTyping || lines.length === 0 || !activeLine) {
      return;
    }

    if (activeLine.chapterTitle) {
      const timer = window.setTimeout(() => {
        if (visibleLineCount >= lines.length) {
          onTypingDone?.();
        } else {
          setVisibleLineCount((value) => value + 1);
        }
      }, paragraphDelay);
      return () => window.clearTimeout(timer);
    }

    if (currentText.length < activeLine.text.length) {
      const timer = window.setTimeout(() => {
        setCurrentText(activeLine.text.slice(0, currentText.length + 1));
      }, charDelay);
      return () => window.clearTimeout(timer);
    }

    const delay = activeLine.text.trim() === "" ? paragraphDelay : lineDelay;
    const timer = window.setTimeout(() => {
      setCurrentText("");
      if (visibleLineCount >= lines.length) {
        onTypingDone?.();
      } else {
        setVisibleLineCount((value) => value + 1);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    activeLine,
    charDelay,
    currentText,
    isTyping,
    lineDelay,
    lines.length,
    onTypingDone,
    paragraphDelay,
    visibleLineCount,
  ]);

  function skip() {
    if (!canSkip || !isTyping) {
      return;
    }
    setVisibleLineCount(lines.length);
    setCurrentText("");
    onSkip?.();
    onTypingDone?.();
  }

  return (
    <div
      className="novel-typewriter"
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={skip}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          skip();
        }
      }}
    >
      {lines.slice(0, visibleLineCount).map((line, index) => {
        if (line.chapterTitle) {
          return (
            <h2 className="novel-chapter-title" key={line.key}>
              {line.chapterTitle}
            </h2>
          );
        }

        const isActive = isTyping && index === visibleLineCount - 1;
        return (
          <p className="novel-line" key={line.key}>
            {isActive ? currentText : line.text}
            {isActive && <span className="type-caret" />}
          </p>
        );
      })}
    </div>
  );
}
