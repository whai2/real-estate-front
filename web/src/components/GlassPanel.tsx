import type { ReactNode } from 'react';

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div className={`glass-panel border border-white/40 ${className}`}>
      {children}
    </div>
  );
}
