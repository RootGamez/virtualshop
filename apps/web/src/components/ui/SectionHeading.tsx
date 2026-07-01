import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}
    >
      {eyebrow && (
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold text-text sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-text-muted">{description}</p>}
    </motion.div>
  );
}
