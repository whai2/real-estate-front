type BadgeVariant = 'danger' | 'warning' | 'safe';

const variants: Record<BadgeVariant, string> = {
  danger: 'bg-error-container text-error',
  warning: 'bg-tertiary-fixed text-on-tertiary-container',
  safe: 'bg-secondary-container/20 text-on-secondary-container',
};

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
