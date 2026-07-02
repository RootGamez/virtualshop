import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fieldClassName } from '../ui/FormField';

const PRESET_SIZES = ['S', 'M', 'L', 'XL'] as const;

interface SizePickerProps {
  /** Talla actualmente seleccionada. */
  value: string;
  onChange: (size: string) => void;
}

/**
 * Selector de talla con presets S/M/L/XL en botones + opción para escribir una
 * talla personalizada (p. ej. "XXL", "38", "Único"). Reemplaza el input de
 * texto libre por algo más rápido e intuitivo.
 */
export function SizePicker({ value, onChange }: SizePickerProps) {
  const isPreset = (PRESET_SIZES as readonly string[]).includes(value);
  const [customOpen, setCustomOpen] = useState(!isPreset && value !== '');

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold font-display uppercase tracking-wide text-text-muted">Talla</span>
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_SIZES.map((size) => {
          const active = value === size;
          return (
            <button
              key={size}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setCustomOpen(false);
                onChange(size);
              }}
              className={cn(
                'flex h-11 min-w-11 items-center justify-center rounded-xl border-2 px-3 text-sm font-bold font-display uppercase transition-all active:scale-95',
                active
                  ? 'border-forest bg-primary text-primary-foreground shadow-sticker-lime'
                  : 'border-border bg-surface text-text hover:border-forest'
              )}
            >
              {size}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={customOpen}
          onClick={() => {
            setCustomOpen(true);
            if (isPreset) onChange('');
          }}
          className={cn(
            'flex h-11 items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-bold font-display uppercase transition-all active:scale-95',
            customOpen
              ? 'border-forest bg-secondary text-secondary-foreground shadow-sticker'
              : 'border-dashed border-border bg-surface text-text-muted hover:border-forest hover:text-text'
          )}
        >
          <Plus className="size-4" />
          Otra
        </button>
      </div>

      {customOpen && (
        <div className="relative mt-1 flex items-center">
          <input
            type="text"
            autoFocus
            value={isPreset ? '' : value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="Ej: XXL, 38, Único"
            maxLength={12}
            className={cn(fieldClassName, 'pr-9 uppercase')}
          />
          {value !== '' && !isPreset && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setCustomOpen(false);
              }}
              aria-label="Limpiar talla"
              className="absolute right-3 text-text-muted hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { PRESET_SIZES };
