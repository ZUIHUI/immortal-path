interface NovelMainButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function NovelMainButton({ label, disabled = false, onClick }: NovelMainButtonProps) {
  return (
    <button className="novel-main-button" disabled={disabled} type="button" onClick={onClick}>
      {label}
    </button>
  );
}
