import { Tag } from 'lucide-react';
import { SelectField } from '../ui/FormField';
import { NumberField } from '../ui/NumberField';
import { Badge } from '../ui/badge';
import { previewDiscount, type DiscountEntryMode } from '../../lib/discountPreview';

interface DiscountFieldsProps {
  price: number;
  mode: DiscountEntryMode;
  value: number | undefined;
  onModeChange: (mode: DiscountEntryMode) => void;
  onValueChange: (value: number | undefined) => void;
}

/** Doble entrada de descuento (spec §10) con preview en vivo. */
export function DiscountFields({ price, mode, value, onModeChange, onValueChange }: DiscountFieldsProps) {
  const preview = previewDiscount(price, mode, value);
  const showPreview = mode !== 'none' && value != null && !Number.isNaN(value);

  return (
    <div className="flex flex-col gap-3 rounded-xl2 border-2 border-accent/40 bg-lime-soft/40 p-4">
      <div className="flex items-center gap-2 text-sm font-bold font-display uppercase tracking-wide text-forest">
        <Tag className="size-4" />
        Descuento
      </div>

      <SelectField
        label="Tipo"
        value={mode}
        onChange={(e) => {
          onModeChange(e.target.value as DiscountEntryMode);
          onValueChange(undefined);
        }}
      >
        <option value="none">Sin descuento</option>
        <option value="percent">Ingresar porcentaje</option>
        <option value="finalPrice">Ingresar precio final</option>
      </SelectField>

      {mode !== 'none' && (
        <NumberField
          label={mode === 'percent' ? 'Porcentaje' : 'Precio final'}
          min={0}
          max={mode === 'percent' ? 100 : undefined}
          value={value ?? null}
          onValueChange={(v) => onValueChange(v ?? undefined)}
          prefix={mode === 'finalPrice' ? '$' : undefined}
          suffix={mode === 'percent' ? '%' : undefined}
          placeholder="0"
        />
      )}

      {showPreview && (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          Precio final: <span className="font-display font-bold text-text">${preview.finalPrice}</span>
          <Badge variant="accent">-{preview.discountValue}%</Badge>
        </p>
      )}
    </div>
  );
}
