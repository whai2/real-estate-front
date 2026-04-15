import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}
