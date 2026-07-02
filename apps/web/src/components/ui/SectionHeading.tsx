import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  /** 'inverse' para secciones con fondo oscuro (forest). */
  tone?: 'default' | 'inverse';
}

export function SectionHeading({ eyebrow, title, description, align = 'center', tone = 'default' }: SectionHeadingProps) {
  const inverse = tone === 'inverse';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}
    >
      {eyebrow && (
        <span className="inline-block -rotate-1 rounded-md border-2 border-forest bg-accent px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-accent-foreground">
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'mt-4 font-display text-3xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl',
          inverse ? 'text-bone' : 'text-text'
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-4 text-base sm:text-lg', inverse ? 'text-bone/75' : 'text-text-muted')}>{description}</p>
      )}
    </motion.div>
  );
}
