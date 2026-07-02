import { motion } from 'motion/react';

const STATS = [
  { value: '+100', label: 'Prendas originales en catálogo' },
  { value: '24–72h', label: 'Entrega en todo el país' },
  { value: '100%', label: 'Importado y verificado' },
  { value: 'CCS', label: 'Con base en Caracas' },
] as const;

export function StatsSection() {
  return (
    <section aria-label="La tienda en números" className="border-b-2 border-forest/10 bg-surface px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.value}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            className="group rounded-xl border-2 border-forest bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-sticker-lime"
          >
            <p className="font-display text-3xl font-bold uppercase text-forest sm:text-4xl">
              <span className="bg-accent box-decoration-clone px-1">{stat.value}</span>
            </p>
            <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
