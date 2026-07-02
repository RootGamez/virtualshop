import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, type MotionStyle } from 'motion/react';
import { MapPin, ArrowRight, Truck, BadgeCheck } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import { Button } from '../ui/button';
import { PaintSplat, SprayDots, Scribble } from '../ui/PaintDecor';
import { TrustMarquee } from './TrustMarquee';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

/* Textura urbana libre (Unsplash) — se funde con el fondo, es solo grano visual. */
const WALL_TEXTURE =
  'https://images.unsplash.com/photo-1561059488-916d69792237?auto=format&fit=crop&w=1600&q=55';

export function Hero({ content }: { content?: HeroContent }) {
  const title = content?.title || BRAND.tagline;
  const subtitle =
    content?.subtitle ||
    'Piezas originales seleccionadas en el exterior, curadas en Caracas y enviadas a cualquier rincón del país.';
  const ctaLabel = content?.ctaLabel || 'Ver catálogo';

  /*
   * ═══ SCROLL MOTION ═══
   * El progreso se mide contra LA PROPIA SECCIÓN (no contra píxeles absolutos
   * de scrollY): 0 = hero pegado arriba, 1 = hero fuera del viewport. Así el
   * parallax funciona igual en cualquier altura de pantalla y no depende de
   * números mágicos. Solo transform/opacity (GPU-friendly, spec §12).
   */
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Capas a distintas velocidades = profundidad. El contenido baja más lento
  // que el scroll real y se desvanece; los splats se cruzan en direcciones opuestas.
  const watermarkY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const splatRightY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const splatLeftY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.3]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  // Con reduced-motion no aplicamos NINGÚN binding de scroll: sección estática.
  const motionStyle = (style: MotionStyle): MotionStyle | undefined =>
    reducedMotion ? undefined : style;

  // Últimas dos palabras en lime para el golpe tipográfico
  const words = title.split(' ');
  const head = words.slice(0, Math.max(0, words.length - 2)).join(' ');
  const tail = words.slice(Math.max(0, words.length - 2)).join(' ');

  return (
    <section ref={sectionRef} className="texture-grain relative isolate overflow-hidden bg-gradient-hero">
      {/* Capa de textura urbana */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-10 mix-blend-overlay"
        style={{ backgroundImage: `url(${WALL_TEXTURE})` }}
      />
      {/* Pintura y spray con parallax */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <motion.div style={motionStyle({ y: splatRightY, willChange: 'transform' })} className="absolute -right-16 -top-20">
          <PaintSplat className="w-72 rotate-12 text-lime opacity-90 sm:w-96" />
        </motion.div>
        <motion.div style={motionStyle({ y: splatLeftY, willChange: 'transform' })} className="absolute -bottom-24 -left-20">
          <PaintSplat className="w-64 -rotate-45 text-sky opacity-60 sm:w-80" />
        </motion.div>
        <SprayDots className="absolute left-[8%] top-[18%] w-24 text-lime/50" />
        <SprayDots className="absolute bottom-[22%] right-[12%] w-28 rotate-45 text-sky/40" />
        {/* Marca de agua gigante */}
        <motion.span
          style={motionStyle({ y: watermarkY, willChange: 'transform' })}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 select-none font-display text-[26vw] font-bold uppercase leading-none text-bone/[0.04] sm:text-[18vw]"
        >
          {BRAND.shortName}
        </motion.span>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28">
        {/* Capa externa: SOLO transform ligado al scroll (MotionValues) */}
        <motion.div
          style={motionStyle({ y: contentY, opacity: contentOpacity, scale: contentScale, willChange: 'transform, opacity' })}
          className="mx-auto max-w-3xl"
        >
          {/* Capa interna: SOLO animación de entrada al montar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-lime/40 bg-forest-deep/60 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-lime backdrop-blur">
              <MapPin className="size-4" aria-hidden="true" /> Caracas · Envíos a toda Venezuela
            </span>

            <h1 className="mt-8 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-bone sm:text-7xl md:text-8xl">
              {head && <span className="block">{head}</span>}
              <span className="relative mt-1 inline-block text-lime">
                {tail}
                <Scribble aria-hidden="true" className="absolute -bottom-5 left-0 w-full text-sky" />
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg text-bone/80">{subtitle}</p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Button asChild size="lg" variant="accent">
                <Link to="/catalogo">{ctaLabel}<ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-bone text-bone hover:bg-bone hover:text-forest">
                <a href="#como-funciona">Cómo pedir</a>
              </Button>
            </motion.div>

            {/* Mini prueba de confianza */}
            <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-sky">
              <li className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-lime" aria-hidden="true" /> 100% original importado
              </li>
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-lime" aria-hidden="true" /> Entregas en 24–72 h
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-lime" aria-hidden="true" /> Delivery en Caracas
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      <TrustMarquee className="relative z-[2]" />
    </section>
  );
}
