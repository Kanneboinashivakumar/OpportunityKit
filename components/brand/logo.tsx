import Image from 'next/image';
import { cn } from '@/lib/utils';

export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <span className={cn('relative block h-9 w-[184px] shrink-0 overflow-hidden', className)}>
      <Image
        src="/images/opportunitykit-logo.png"
        alt="OpportunityKit"
        fill
        sizes="184px"
        className="brand-logo-image object-cover"
      />
    </span>
  );
}
