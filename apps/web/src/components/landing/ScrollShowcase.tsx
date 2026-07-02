import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { PaintSplat } from '../ui/PaintDecor';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/*
 * ═══ LOOKBOOK CON MOTION SCROLLING ═══
 * El contenedor mide FRAMES.length × 100vh; el visor queda sticky y cada
 * frame se funde/desplaza según el progreso del scroll.
 * Para cambiar las fotos: reemplaza los `src` (imágenes libres de Unsplash).
 */
const FRAMES = [
  {
    src: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=900&q=70',
    label: '01',
    caption: 'Streetwear que habla por ti',
  },
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=70',
    label: '02',
    caption: 'Piezas seleccionadas a mano',
  },
  {
    src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=70',
    label: '03',
    caption: 'Calidad que se siente al tacto',
  },
  {
    src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=70',
    label: '04',
    caption: 'Drops nuevos cada semana',
  },
] as const;

const N = FRAMES.length;
const FADE = 0.06; // ventana de crossfade (fracción del progreso total)

function Frame({
  frame,
  index,
  progress,
}: {
  frame: (typeof FRAMES)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const start = index / N;
  const end = (index + 1) / N;
  const isFirst = index === 0;
  const isLast = index === N - 1;

  // El primero arranca visible y el último se queda visible: sin pantallas vacías.
  const opacity = useTransform(
    progress,
    [isFirst ? 0 : start - FADE, isFirst ? 0.0001 : start + FADE, isLast ? 1 - 0.0001 : end - FADE, isLast ? 1 : end + FADE],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
  );
  // Parallax vertical + zoom suave dentro de su tramo
  const y = useTransform(progress, [start - FADE, end + FADE], [48, -48]);
  const scale = useTransform(progress, [start - FADE, end + FADE], [1.06, 1]);
  const captionY = useTransform(progress, [start - FADE, start + FADE], [24, 0]);

  return (
    <motion.figure style={{ opacity }} className="absolute inset-0 flex items-center justify-center px-4 pb-24 pt-10 sm:pb-28">
      <div className="relative h-full max-h-[70dvh] w-full max-w-md overflow-hidden rounded-xl2 border-4 border-lime bg-forest shadow-glow">
        <motion.img
          src={frame.src}
          alt={frame.caption}
          loading={isFirst ? 'eager' : 'lazy'}
          decoding="async"
          style={{ y, scale }}
          className="h-full w-full object-cover"
        />
        {/* Velo forest para mantener la foto on-brand */}
        <div aria-hidden="true" className="absolute inset-0 bg-forest/25 mix-blend-multiply" />
        <span aria-hidden="true" className="absolute right-3 top-3 rounded-md border-2 border-forest bg-accent px-2 py-0.5 font-display text-xs font-bold text-accent-foreground">
          {frame.label} / {String(N).padStart(2, '0')}
        </span>
      </div>
      <motion.figcaption
        style={{ y: captionY }}
        className="absolute bottom-10 left-1/2 w-max max-w-[90vw] -translate-x-1/2 -rotate-1 rounded-md border-2 border-forest bg-accent px-4 py-2 text-center font-display text-sm font-bold uppercase tracking-wide text-accent-foreground sm:text-base"
      >
        {frame.caption}
      </motion.figcaption>
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
        <div className="relative z-[2] mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FRAMES.map((frame) => (
            <figure key={frame.label} className="overflow-hidden rounded-xl2 border-4 border-lime bg-forest">
              <img src={frame.src} alt={frame.caption} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
              <figcaption className="px-4 py-3 text-center font-display text-sm font-bold uppercase text-bone">{frame.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="Lookbook" className="relative bg-forest-deep" style={{ height: `${N * 100}vh` }}>
      <div className="texture-grain sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <PaintSplat aria-hidden="true" className="absolute -left-20 top-16 w-64 -rotate-12 text-sky/20" />
        <PaintSplat aria-hidden="true" className="absolute -right-24 bottom-10 w-80 rotate-45 text-lime/15" />
        {FRAMES.map((frame, i) => (
          <Frame key={frame.label} frame={frame} index={i} progress={scrollYProgress} />
        ))}
        {/* Barra de progreso lateral */}
        <div aria-hidden="true" className="absolute right-4 top-1/2 h-40 w-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-forest-mid sm:right-8">
          <motion.div style={{ scaleY: barScale }} className="h-full w-full origin-top rounded-full bg-lime" />
        </div>
      </div>
    </section>
  );
}
