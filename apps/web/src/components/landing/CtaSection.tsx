import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-xl2 bg-gradient-party p-10 text-center shadow-glow sm:p-16"
      >
        <span className="absolute -left-8 -top-8 size-40 rounded-full bg-white/20 blur-2xl" />
        <span className="absolute -bottom-10 -right-6 size-48 rounded-full bg-white/15 blur-2xl" />
        <h2 className="relative font-display text-3xl font-bold text-white sm:text-5xl">¿Lista para brillar?</h2>
        <p className="relative mx-auto mt-3 max-w-md text-white/90">Descubrí toda la ropa importada de JAW Project y pedí por WhatsApp en un click.</p>
        <div className="relative mt-8">
          <Button asChild size="lg" className="bg-white text-onyx hover:bg-white/90">
            <Link to="/catalogo">Ver todo el catálogo<ArrowRight /></Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
