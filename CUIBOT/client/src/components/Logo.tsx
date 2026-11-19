import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <HeartPulse className="h-6 w-6" strokeWidth={2.2} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary ring-2 ring-white" />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="font-heading text-xl font-extrabold tracking-tight text-foreground">CUIBOT</p>
          <p className="text-[11px] font-medium text-muted-foreground">Tu asistente para la diabetes</p>
        </div>
      ) : null}
    </div>
  );
}
