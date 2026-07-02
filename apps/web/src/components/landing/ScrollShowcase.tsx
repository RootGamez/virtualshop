import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { PaintSplat } from '../ui/PaintDecor';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/*
 * ═══ EFECTO DE MOTION SCROLLING ═══
 * Añade aquí la sucesión de imágenes (cuando las tengas listas) poniendo `src`.
 * Cada frame se funde con el siguiente a medida que el usuario hace scroll.
 * Mientras no haya `src`, se muestra un placeholder tipográfico on-brand.
 */
const FRAMES: { src?: string; label: string; caption: string }[] = [
  { label: '01', caption: 'Streetwear que habla por ti' },
  { label: '02', caption: 'Calidad que se siente al tacto' },
  { label: '03', caption: 'Drops nuevos cada semana' },
];

function Frame({
  frame,
  index,
  total,
  progress,
}: {
  frame: (typeof FRAMES)[number];
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start - 0.08, start + 0.08, end - 0.08, end + 0.08], [0, 1, 1, 0]);
  const scale = useTransform(progress, [start, end], [1.05, 0.98]);
  return (
    <motion.figure style={{ opacity, scale }} className="absolute inset-0 flex items-center justify-center px-4">
      {frame.src ? (
        <img
          src={frame.src}
          alt={frame.caption}
          loading="lazy"
          decoding="async"
          className="max-h-[70dvh] w-auto max-w-full rounded-xl2 border-4 border-lime object-cover shadow-glow"
        />
      ) : (
        <div className="texture-halftone relative flex aspect-[4/5] max-h-[65dvh] w-full max-w-md items-center justify-center rounded-xl2 border-4 border-lime bg-forest text-forest-mid">
          <span aria-hidden="true" className="font-display text-[9rem] font-bold leading-none text-outline-lime">
            {frame.label}
          </span>
        </div>
      )}
      <figcaption className="absolute bottom-10 left-1/2 w-max max-w-[90vw] -translate-x-1/2 -rotate-1 rounded-md border-2 border-forest bg-accent px-4 py-2 font-display text-sm font-bold uppercase tracking-wide text-accent-foreground sm:text-base">
        {frame.caption}
      </figcaption>
    </motion.figure>
  );
}

export function ScrollShowcase() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Sin animación: grid estático accesible
  if (reducedMotion) {
    return (
      <section className="texture-grain relative bg-forest-deep px-4 py-20 sm:px-6">
        <div className="relative z-[2] mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
          {FRAMES.map((frame) => (
            <figure key={frame.label} className="texture-halftone flex aspect-[4/5] flex-col items-center justify-center rounded-xl2 border-4 border-lime bg-forest text-forest-mid">
              <span aria-hidden="true" className="font-display text-7xl font-bold text-outline-lime">{frame.label}</span>
              <figcaption className="mt-4 px-4 text-center font-display text-sm font-bold uppercase text-bone">{frame.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Lookbook" className="relative bg-forest-deep" style={{ height: `${FRAMES.length * 100}vh` }}>
      <div className="texture-grain sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <PaintSplat aria-hidden="true" className="absolute -left-20 top-16 w-64 -rotate-12 text-sky/20" />
        <PaintSplat aria-hidden="true" className="absolute -right-24 bottom-10 w-80 rotate-45 text-lime/15" />
        {FRAMES.map((frame, i) => (
          <Frame key={frame.label} frame={frame} index={i} total={FRAMES.length} progress={scrollYProgress} />
        ))}
        {/* Barra de progreso lateral */}
        <div aria-hidden="true" className="absolute right-4 top-1/2 h-40 w-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-forest-mid sm:right-8">
          <motion.div style={{ scaleY: barScale }} className="h-full w-full origin-top rounded-full bg-lime" />
        </div>
      </div>
    </section>
  );
}
