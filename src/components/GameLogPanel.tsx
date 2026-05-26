import type { GameLog } from "../types";

interface GameLogPanelProps {
  logs: GameLog[];
}

export function GameLogPanel({ logs }: GameLogPanelProps) {
  return (
    <section className="panel log-panel">
      <h2>修仙日誌</h2>
      {logs.length === 0 ? (
        <p className="muted">尚無紀錄。</p>
      ) : (
        <ol>
          {logs.slice(0, 12).map((log) => (
            <li key={log.id}>
              <span>{log.type}</span>
              <p>{log.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
