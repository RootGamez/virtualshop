import { motion } from 'motion/react';
import type { Product, WhatsappConfig } from '@virtualshop/shared';
import { openWhatsappOrder } from '../../lib/whatsapp';

interface OrderButtonProps {
  product: Product;
  whatsappConfig: WhatsappConfig | undefined;
}

/** CTA principal del flujo de pedido (spec §9). */
export function OrderButton({ product, whatsappConfig }: OrderButtonProps) {
  const disabled = !whatsappConfig || !product.isActive;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={() => whatsappConfig && openWhatsappOrder(product, whatsappConfig)}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-success px-6 py-4 text-base font-semibold text-success-foreground shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    >
      Pedir por WhatsApp
    </motion.button>
  );
}
