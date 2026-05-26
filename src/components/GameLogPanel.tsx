import type { GameLog } from "../types";

interface GameLogPanelProps {
  logs: GameLog[];
}

const logLabels: Record<string, string> = {
  system: "天道",
  life: "轉生",
  cultivation: "修煉",
  breakthrough: "突破",
  event: "奇遇",
  death: "身死",
  reincarnation: "輪迴",
  shop: "命盤",
};

export function GameLogPanel({ logs }: GameLogPanelProps) {
  return (
    <section className="panel log-panel">
      <h2>修仙日誌</h2>
      {logs.length === 0 ? (
        <p className="muted">此世尚未留下因果。</p>
      ) : (
        <ol>
          {logs.slice(0, 12).map((log) => (
            <li key={log.id}>
              <span className="log-type">{logLabels[log.type] ?? log.type}</span>
              <p>{log.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
