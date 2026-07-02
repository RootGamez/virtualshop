import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold font-display uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 active:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Forest sobre claro, texto lime — botón "premium" */
        primary:
          'bg-primary text-primary-foreground shadow-sticker-lime hover:-translate-y-0.5 hover:brightness-110',
        /* Lime eléctrico con offset forest — CTA principal estilo sticker */
        accent:
          'bg-accent text-accent-foreground border-2 border-forest shadow-sticker hover:-translate-y-0.5 hover:brightness-105',
        secondary:
          'bg-secondary text-secondary-foreground border-2 border-forest shadow-sticker hover:-translate-y-0.5',
        /* Alias legacy: degradado lime→sky */
        party:
          'bg-gradient-party text-forest border-2 border-forest shadow-sticker hover:-translate-y-0.5 hover:brightness-105',
        outline:
          'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
        ghost: 'text-text hover:bg-muted',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4',
        md: 'h-11 px-6',
        lg: 'h-14 px-8 text-base',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);
Button.displayName = 'Button';

export { buttonVariants };
