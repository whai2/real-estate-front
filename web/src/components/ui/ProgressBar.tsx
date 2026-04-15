type ProgressBarProps = {
  value: number;
  max?: number;
  color?: string;
};

export function ProgressBar({ value, max = 100, color = 'bg-secondary' }: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-[10px] font-bold ${value < 40 ? 'text-error' : ''}`}>
        {value}/{max}
      </span>
    </div>
  );
}
