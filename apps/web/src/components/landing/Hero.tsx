import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import { Button } from '../ui/button';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const HeroScene = lazy(() => import('./HeroScene'));

interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

export function Hero({ content }: { content?: HeroContent }) {
  const title = content?.title || BRAND.name;
  const subtitle = content?.subtitle || BRAND.tagline;
  const ctaLabel = content?.ctaLabel || 'Ver catálogo';
  const reducedMotion = usePrefersReducedMotion();
  return (
    <section className="relative isolate overflow-hidden bg-gradient-hero px-4 py-24 sm:px-6 sm:py-32">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {reducedMotion ? (
          <FallbackBlobs />
        ) : (
          <Suspense fallback={<FallbackBlobs />}>
            <HeroScene />
          </Suspense>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
          <Sparkles className="size-4" /> Importado · Original · Para vos
        </span>
        <h1 className="mt-6 font-display text-5xl font-bold leading-tight tracking-tight text-white sm:text-7xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">{subtitle}</p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" variant="party">
            <Link to="/catalogo">{ctaLabel}<ArrowRight /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-onyx">
            <Link to="/catalogo">Ver ofertas</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FallbackBlobs() {
  return (
    <div className="h-full w-full">
      <div className="absolute left-[10%] top-[20%] size-52 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute right-[12%] top-[15%] size-60 rounded-full bg-secondary/30 blur-3xl" />
      <div className="absolute bottom-[10%] left-[35%] size-56 rounded-full bg-accent/30 blur-3xl" />
    </div>
  );
}
