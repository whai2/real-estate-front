import type { ReactNode } from 'react';

type TableProps = {
  children: ReactNode;
  className?: string;
};

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left border-separate border-spacing-y-2 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-surface-container-high">{children}</tr>
    </thead>
  );
}

export function TableHeadCell({
  children,
  className = '',
  align,
}: {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <th
      className={`px-6 py-4 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant first:rounded-l-xl last:rounded-r-xl ${align === 'right' ? 'text-right' : ''} ${className}`}
    >
      {children}
    </th>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="bg-surface-container-lowest hover:bg-surface-bright transition-colors">
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = '',
  align,
}: {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) {
  return (
    <td
      className={`px-6 py-5 first:rounded-l-xl last:rounded-r-xl ${align === 'right' ? 'text-right' : ''} ${className}`}
    >
      {children}
    </td>
  );
}
