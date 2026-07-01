import { motion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

/** Título de sección con animación de entrada al hacer scroll (spec §3, whileInView). */
export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-2xl text-center"
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-bold text-text sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-text-muted">{description}</p>}
    </motion.div>
  );
}
