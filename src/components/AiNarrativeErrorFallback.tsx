interface AiNarrativeErrorFallbackProps {
  error: string | null;
}

export function AiNarrativeErrorFallback({ error }: AiNarrativeErrorFallbackProps) {
  return (
    <section className="panel rarity-card rarity-rare">
      <p className="eyebrow">天機混沌</p>
      <h2>改由既有事件推進</h2>
      <p>
        天機霧重，命盤暫不可見。此段歷練已自動切回固定事件，不會中斷本世流程。
      </p>
      {error && <p className="muted">{error}</p>}
    </section>
  );
}
