import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import { Button } from '../ui/button';
import { PaintSplat, SprayDots } from '../ui/PaintDecor';

export function CtaSection() {
  return (
    <section className="texture-grain relative overflow-hidden bg-gradient-cta px-4 py-24 sm:px-6">
      <PaintSplat aria-hidden="true" className="absolute -right-20 -top-16 w-72 rotate-45 text-forest/15" />
      <PaintSplat aria-hidden="true" className="absolute -bottom-20 -left-16 w-60 -rotate-12 text-sky/40" />
      <SprayDots aria-hidden="true" className="absolute left-[15%] top-[20%] w-24 text-forest/30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-[2] mx-auto max-w-3xl text-center"
      >
        <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] text-forest sm:text-6xl">
          Únete al <span className="text-outline-forest">project</span>
          <span className="align-super text-xl" aria-hidden="true">®</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base font-medium text-forest/80 sm:text-lg">
          Ropa importada, precios claros y pedidos por WhatsApp en un click. Desde {BRAND.location.split(',')[0]} para todo el país.
        </p>
        <div className="mt-9">
          <Button asChild size="lg" variant="primary">
            <Link to="/catalogo">Ver todo el catálogo<ArrowRight /></Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
