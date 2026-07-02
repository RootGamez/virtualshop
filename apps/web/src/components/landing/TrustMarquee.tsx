import { cn } from '../../lib/utils';

const ITEMS = [
  'Envíos a toda Venezuela',
  'Ropa 100% importada',
  'Pedidos por WhatsApp',
  'Nuevos drops cada semana',
  'Desde Caracas',
];

interface TrustMarqueeProps {
  className?: string;
}

/** Cinta de texto en movimiento — clásico streetwear. Se pausa con prefers-reduced-motion. */
export function TrustMarquee({ className }: TrustMarqueeProps) {
  const row = ITEMS.map((item) => (
    <span key={item} className="flex items-center gap-6 px-3">
      <span className="font-display text-sm font-bold uppercase tracking-widest">{item}</span>
      <span aria-hidden="true" className="text-lg leading-none">★</span>
    </span>
  ));
  return (
    <div className={cn('overflow-hidden border-y-2 border-forest bg-accent py-3 text-accent-foreground', className)}>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <div className="flex shrink-0">{row}</div>
        <div className="flex shrink-0" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
