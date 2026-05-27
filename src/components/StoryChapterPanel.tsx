import { getNextStoryChapter, getStoryChapterByRealmId } from "../data/storyChapters";
import type { Player } from "../types";

interface StoryChapterPanelProps {
  player: Player;
}

export function StoryChapterPanel({ player }: StoryChapterPanelProps) {
  const chapter = getStoryChapterByRealmId(player.realmId);
  const nextChapter = getNextStoryChapter(player.realmId);

  return (
    <section className="panel scene-panel story-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">主線章節</p>
          <h2>{chapter.title}</h2>
        </div>
        <span className="badge badge-gold">第 {chapter.realmRange.minOrder} - {chapter.realmRange.maxOrder} 階</span>
      </div>
      <p>{chapter.summary}</p>
      <div className="status-grid compact">
        <div className="stat-tile">
          <span>目前主線</span>
          <strong>{chapter.currentObjective}</strong>
        </div>
        <div className="stat-tile">
          <span>下一目標</span>
          <strong>{chapter.nextObjective}</strong>
        </div>
      </div>
      <div className="story-tag-row" aria-label="劇情地點">
        {chapter.locations.map((location) => (
          <span className="pill" key={location}>
            {location}
          </span>
        ))}
      </div>
      {nextChapter && (
        <p className="muted">下一篇章：{nextChapter.title}</p>
      )}
    </section>
  );
}
