import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  icono?: LucideIcon;
  acciones?: ReactNode;
  className?: string;
}

export function PageHeader({ titulo, descripcion, icono: Icono, acciones, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        {Icono ? (
          <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary/70 text-primary-ink ring-1 ring-primary/20">
            <Icono className="h-5 w-5" />
          </span>
        ) : null}
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {titulo}
          </h1>
          {descripcion ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{descripcion}</p> : null}
        </div>
      </div>
      {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
    </header>
  );
}
