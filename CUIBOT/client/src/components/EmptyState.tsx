import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
}

export function EmptyState({ icono: Icono, titulo, descripcion, accion, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/35 bg-secondary/15 px-5 py-10 text-center',
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary-ink shadow-sm ring-1 ring-primary/15">
        <Icono className="h-6 w-6" />
      </span>
      <div>
        <p className="font-heading text-sm font-bold text-foreground">{titulo}</p>
        {descripcion ? <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{descripcion}</p> : null}
      </div>
      {accion}
    </div>
  );
}
