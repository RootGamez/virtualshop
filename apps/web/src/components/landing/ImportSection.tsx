import { motion } from 'motion/react';
import { Search, MessageCircle, Wallet, PackageCheck } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { PaintDrips } from '../ui/PaintDecor';

const STEPS = [
  {
    Icon: Search,
    title: 'Explora el catálogo',
    body: 'Piezas importadas y verificadas, organizadas por categoría, con tallas y colores disponibles en tiempo real.',
  },
  {
    Icon: MessageCircle,
    title: 'Pide por WhatsApp',
    body: 'Toca "Pedir" en la prenda que quieres y se abre el chat con nosotros, con tu pedido ya armado.',
  },
  {
    Icon: Wallet,
    title: 'Paga como prefieras',
    body: 'Pago Móvil, transferencia, Zelle, Binance o efectivo. Te confirmamos todo por el mismo chat.',
  },
  {
    Icon: PackageCheck,
    title: 'Recíbelo donde estés',
    body: 'Delivery en Caracas el mismo día, y envíos a todo el país por MRW o Zoom en 24–72 horas.',
  },
] as const;

export function ImportSection() {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 bg-secondary px-4 pb-24 pt-20 sm:px-6">
      {/* Trama de puntos sutil */}
      <div aria-hidden="true" className="texture-halftone absolute inset-0 text-forest opacity-10" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="De la vitrina a tu puerta"
          description="Sin carrito, sin registros, sin vueltas: hablas directo con nosotros y en minutos tu pedido está en marcha."
        />
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, title, body }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
              className="relative flex flex-col gap-3 rounded-xl2 border-2 border-forest bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-sticker"
            >
              <span aria-hidden="true" className="absolute -top-4 left-5 rounded-md border-2 border-forest bg-accent px-2 py-0.5 font-display text-sm font-bold text-accent-foreground">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="mt-2 grid size-14 place-items-center rounded-xl bg-forest text-lime">
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-bold uppercase leading-tight text-text">{title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
      {/* Goteo de pintura hacia la siguiente sección */}
      <PaintDrips aria-hidden="true" className="absolute left-0 top-full z-[2] h-10 w-full text-secondary" />
    </section>
  );
}
