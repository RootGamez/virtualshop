import { SelectField, TextField } from '../ui/FormField';
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

  return (
    <div className="rounded-lg border border-border p-4">
      <SelectField
        label="Descuento"
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
        <div className="mt-3">
          <TextField
            label={mode === 'percent' ? 'Porcentaje (%)' : 'Precio final ($)'}
            type="number"
            min={0}
            max={mode === 'percent' ? 100 : undefined}
            step="0.01"
            value={value ?? ''}
            onChange={(e) => onValueChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
      )}

      {mode !== 'none' && value != null && !Number.isNaN(value) && (
        <p className="mt-3 text-sm text-text-muted">
          Precio final: <span className="font-semibold text-text">${preview.finalPrice}</span>{' '}
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
            -{preview.discountValue}%
          </span>
        </p>
      )}
    </div>
  );
}
