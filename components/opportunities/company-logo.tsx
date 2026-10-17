import React from 'react';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  title?: string;
  className?: string;
}

export function CompanyLogo({ title = '', className }: CompanyLogoProps) {
  const t = title.toLowerCase();

  if (t.includes('google')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center p-2 shrink-0 shadow-2xs", className)}>
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      </div>
    );
  }

  if (t.includes('microsoft')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center p-2 shrink-0 shadow-2xs", className)}>
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#F25022" d="M1 1h10v10H1z" />
          <path fill="#00A4EF" d="M1 13h10v10H1z" />
          <path fill="#7FBA00" d="M13 1h10v10H13z" />
          <path fill="#FFB900" d="M13 13h10v10H13z" />
        </svg>
      </div>
    );
  }

  if (t.includes('adobe')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-[#FA0F00] flex items-center justify-center p-2 shrink-0 shadow-2xs", className)}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
          <path d="M13.9 3h9.1v18h-5.2l-3.9-9.8zm-3.8 0H1v18h5.2l3.9-9.8zM12 9.8l3.6 9.2h-2.9l-1-2.6H8.3z" />
        </svg>
      </div>
    );
  }

  if (t.includes('isro')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center p-1.5 shrink-0 shadow-2xs", className)}>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#E65100] tracking-tighter">ISRO</span>
          <span className="text-[7px] text-[#2E7D32] -mt-1 font-semibold">इसरो</span>
        </div>
      </div>
    );
  }

  if (t.includes('nvidia')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-[#76B900] flex items-center justify-center p-2 shrink-0 shadow-2xs", className)}>
        <span className="text-white font-black text-xs tracking-tight">NV</span>
      </div>
    );
  }

  if (t.includes('infosys')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-[#007CC3] flex items-center justify-center p-1.5 shrink-0 shadow-2xs", className)}>
        <span className="text-white font-bold text-[10px] tracking-tight">infosys</span>
      </div>
    );
  }

  if (t.includes('reliance')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-[#004B87] flex items-center justify-center p-1.5 shrink-0 shadow-2xs", className)}>
        <span className="text-white font-bold text-[10px] tracking-tighter">RIL</span>
      </div>
    );
  }

  if (t.includes('iit') || t.includes('nit') || t.includes('iiit') || t.includes('university') || t.includes('institute')) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center p-2 shrink-0 shadow-2xs", className)}>
        <Building2 className="w-5 h-5 text-[#2D5542]" />
      </div>
    );
  }

  // Fallback monogram
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'OK';

  return (
    <div className={cn("w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] flex items-center justify-center shrink-0 shadow-2xs", className)}>
      <span className="text-xs font-bold text-[#16233B] tracking-wide">{initials}</span>
    </div>
  );
}
