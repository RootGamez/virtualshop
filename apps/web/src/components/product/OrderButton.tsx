import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import type { Product, WhatsappConfig } from '@jaw/shared';
import { openWhatsappOrder } from '../../lib/whatsapp';
import { Button } from '../ui/button';

interface OrderButtonProps {
  product: Product;
  whatsappConfig: WhatsappConfig | undefined;
}

const MotionButton = motion.create(Button);

export function OrderButton({ product, whatsappConfig }: OrderButtonProps) {
  const disabled = !whatsappConfig || !product.isActive;
  return (
    <MotionButton
      type="button"
      variant="secondary"
      size="lg"
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={() => whatsappConfig && openWhatsappOrder(product, whatsappConfig)}
      className="w-full"
    >
      <MessageCircle />
      Pedir por WhatsApp
    </MotionButton>
  );
}
