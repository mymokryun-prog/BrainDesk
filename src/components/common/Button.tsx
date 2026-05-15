import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-graphite',
  secondary: 'border border-graphite/15 bg-white text-ink hover:bg-mist',
  ghost: 'text-graphite hover:bg-ink/5',
  danger: 'border border-coral/35 bg-coral/10 text-coral hover:bg-coral/15',
};

export function Button({ children, className = '', icon, variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
