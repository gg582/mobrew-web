import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl p-6 transition-all duration-300',
        hover && 'hover:bg-glass-200 hover:border-glass-400 hover:-translate-y-0.5 hover:shadow-xl',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}
