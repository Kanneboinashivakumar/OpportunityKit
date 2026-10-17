import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-navy-50)] text-[var(--color-navy)] border border-[var(--color-navy-50)]',
        secondary: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
        match: 'badge-match',
        mismatch: 'badge-mismatch',
        missing: 'badge-missing',
        outline: 'border border-[var(--color-border)] text-[var(--color-text-muted)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
