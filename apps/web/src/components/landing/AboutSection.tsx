import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import { PaintSplat, SprayDots } from '../ui/PaintDecor';

interface AboutContent {
  title?: string;
  body?: string;
}

/* Foto libre (Unsplash) — pasa por duotono forest, cualquier textura urbana queda on-brand */
const ABOUT_PHOTO =
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=60';

const DEFAULT_TITLE = 'Desde Caracas, para toda Venezuela';
const DEFAULT_BODY =
  'Somos una tienda virtual de ropa importada con base en Caracas. Cada pieza la seleccionamos en el exterior, la revisamos a mano y la publicamos con fotos reales, tallas y stock al día. Sin intermediarios, sin réplicas: lo que ves es lo que llega a tu puerta, estés en la capital o en cualquier estado del país.';

export function AboutSection({ content }: { content?: AboutContent }) {
  const title = content?.title || DEFAULT_TITLE;
  const body = content?.body || DEFAULT_BODY;
  return (
    <section className="texture-grain relative overflow-hidden bg-forest px-4 py-24 sm:px-6">
      <SprayDots aria-hidden="true" className="absolute right-[6%] top-10 w-28 text-lime/30" />
      <PaintSplat aria-hidden="true" className="absolute -left-24 bottom-0 w-72 rotate-12 text-sky/15" />

      <div className="relative z-[2] mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-md border-2 border-lime/50 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-lime">
            <MapPin className="size-4" aria-hidden="true" /> {BRAND.location}
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold uppercase leading-[1.05] text-bone sm:text-5xl">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-bone/80 sm:text-lg">{body}</p>
          <ul className="mt-8 flex flex-wrap gap-3">
            {['Selección curada', 'Fotos reales', 'Stock al día', 'Atención directa'].map((tag) => (
              <li
                key={tag}
                className="rounded-full border-2 border-forest-line bg-forest-deep px-4 py-1.5 text-sm font-semibold text-sky"
              >
                {tag}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, rotate: 0 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="overflow-hidden rounded-xl2 border-4 border-lime bg-forest-deep shadow-glow">
            <img
              src={ABOUT_PHOTO}
              alt="Textura urbana con los colores de la marca"
              loading="lazy"
              decoding="async"
              className="img-duotone aspect-[4/5] w-full object-cover"
            />
          </div>
          <span className="absolute -bottom-4 -left-4 -rotate-6 rounded-md border-2 border-forest bg-accent px-3 py-1.5 font-display text-sm font-bold uppercase text-accent-foreground">
            Est. CCS
          </span>
        </motion.div>
      </div>
    </section>
  );
}
