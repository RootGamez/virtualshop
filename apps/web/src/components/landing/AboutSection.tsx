import { motion } from 'motion/react';
import { SectionHeading } from '../ui/SectionHeading';

interface AboutContent {
  title?: string;
  body?: string;
}

export function AboutSection({ content }: { content?: AboutContent }) {
  if (!content?.body) return null;
  return (
    <section className="px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto max-w-3xl rounded-xl2 border-2 border-border bg-surface p-8 text-center sm:p-12"
      >
        <SectionHeading title={content.title || 'Sobre nosotros'} description={content.body} />
      </motion.div>
    </section>
  );
}
