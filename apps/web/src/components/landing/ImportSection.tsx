import { motion } from 'motion/react';
import { Plane, Sparkles, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

const FEATURES = [
  { Icon: Plane, title: 'Importado de verdad', body: 'Traemos ropa de todo tipo desde el exterior, seleccionada para vos.', color: 'text-primary', ring: 'bg-raspberry-soft' },
  { Icon: Sparkles, title: 'Estilo que resalta', body: 'Prendas vibrantes, juveniles y divertidas para brillar todos los días.', color: 'text-accent', ring: 'bg-carrot-soft' },
  { Icon: ShieldCheck, title: 'Pedido fácil y seguro', body: 'Elegí, tocá "Pedir por WhatsApp" y coordinamos todo al instante.', color: 'text-secondary', ring: 'bg-emerald-soft' },
] as const;

export function ImportSection() {
  return (
    <section className="bg-surface-2 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Por qué JAW" title="Importamos para vos" />
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, body, color, ring }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
              className="flex flex-col items-center gap-3 rounded-xl2 border-2 border-border bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <span className={`grid size-16 place-items-center rounded-full ${ring} ${color}`}>
                <Icon className="size-8" />
              </span>
              <h3 className="font-display text-xl font-bold text-text">{title}</h3>
              <p className="text-sm text-text-muted">{body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
