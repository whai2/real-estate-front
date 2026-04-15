import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-[#031636] to-[#1A2B4C] text-white font-bold hover:brightness-110 transition-all',
  ghost:
    'hover:bg-surface-container-high text-primary transition-colors',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md text-sm px-4 py-2.5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
