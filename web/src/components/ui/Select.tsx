import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 block">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-secondary ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
