import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

const FAQS = [
  {
    q: '¿Hacen envíos a todo el país?',
    a: 'Sí. Trabajamos con MRW y Zoom para envíos nacionales (24–72 horas hábiles) y delivery propio en Caracas, muchas veces el mismo día. El costo del envío se calcula al confirmar tu pedido por WhatsApp.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Pago Móvil, transferencia bancaria, Zelle, Binance (USDT) y efectivo en divisas para entregas en Caracas. Te confirmamos el monto exacto y los datos por el chat.',
  },
  {
    q: '¿La ropa es original?',
    a: 'Toda. Importamos directamente del exterior y revisamos cada pieza a mano antes de publicarla. No trabajamos con réplicas ni imitaciones.',
  },
  {
    q: '¿Cómo sé qué talla pedir?',
    a: 'Cada producto muestra sus tallas y colores con stock real. Si tienes dudas, escríbenos por WhatsApp con tus medidas y te asesoramos antes de confirmar.',
  },
  {
    q: '¿Puedo cambiar una prenda?',
    a: 'Sí: tienes 48 horas después de recibirla para solicitar cambio por talla, siempre que esté sin uso y con sus etiquetas. Los detalles se coordinan por el mismo chat del pedido.',
  },
] as const;

export function FaqSection() {
  return (
    <section id="preguntas" className="scroll-mt-20 bg-surface-2 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Dudas"
          title="Preguntas frecuentes"
          description="Lo que más nos preguntan antes del primer pedido."
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-12 flex flex-col gap-3"
        >
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-xl border-2 border-forest bg-card open:shadow-sticker-lime"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-sm font-bold uppercase tracking-wide text-text [&::-webkit-details-marker]:hidden">
                {q}
                <Plus aria-hidden="true" className="size-5 shrink-0 text-forest transition-transform group-open:rotate-45" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">{a}</p>
            </details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
