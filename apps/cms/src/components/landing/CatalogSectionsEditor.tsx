import { useEffect, useState } from 'react';
import { CATALOG_SECTION_KEYS, type LandingConfig } from '@jaw/shared';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { toastSuccess } from '../../store/toastStore';
import { TextField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';

interface ParamField {
  key: string;
  label: string;
}

interface SectionDef {
  sectionKey: string;
  heading: string;
  params: ParamField[];
}

/** Campos editables por sección (los shapes viven en @jaw/shared dto.ts). */
const SECTION_DEFS: SectionDef[] = [
  {
    sectionKey: CATALOG_SECTION_KEYS.drops,
    heading: 'Últimos drops',
    params: [
      { key: 'windowDays', label: 'Ventana del badge NUEVO (días)' },
      { key: 'limit', label: 'Máx. de productos' },
    ],
  },
  {
    sectionKey: CATALOG_SECTION_KEYS.bestSellers,
    heading: 'Más comprados',
    params: [
      { key: 'days', label: 'Ventana de conteo (días)' },
      { key: 'limit', label: 'Máx. de productos' },
    ],
  },
  {
    sectionKey: CATALOG_SECTION_KEYS.lowStock,
    heading: 'Se están acabando',
    params: [
      { key: 'threshold', label: 'Umbral de stock' },
      { key: 'limit', label: 'Máx. de productos' },
    ],
  },
];

interface CatalogSectionsEditorProps {
  sections: LandingConfig[] | undefined;
  onSaved: () => void;
}

/**
 * Rails de merchandising del catálogo público: activar/desactivar, reordenar
 * y ajustar parámetros. Cada fila vive en landing_config (keys catalog_*).
 */
export function CatalogSectionsEditor({ sections, onSaved }: CatalogSectionsEditorProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-text">Secciones del catálogo</h2>
      <p className="text-xs text-text-muted">
        Carruseles de merchandising que aparecen arriba del catálogo público. Orden menor = más arriba.
      </p>
      <div className="mt-3 flex flex-col gap-4">
        {SECTION_DEFS.map((def) => (
          <CatalogSectionForm
            key={def.sectionKey}
            def={def}
            section={sections?.find((s) => s.sectionKey === def.sectionKey)}
            onSaved={onSaved}
          />
        ))}
      </div>
    </section>
  );
}

function CatalogSectionForm({
  def,
  section,
  onSaved,
}: {
  def: SectionDef;
  section?: LandingConfig;
  onSaved: () => void;
}) {
  const content = (section?.content ?? {}) as Record<string, unknown>;
  const [active, setActive] = useState(section?.isActive ?? true);
  const [order, setOrder] = useState(String(section?.displayOrder ?? 0));
  const [title, setTitle] = useState(typeof content.title === 'string' ? content.title : '');
  const [params, setParams] = useState<Record<string, string>>(() => initialParams(def, content));

  useEffect(() => {
    setActive(section?.isActive ?? true);
    setOrder(String(section?.displayOrder ?? 0));
    setTitle(typeof content.title === 'string' ? content.title : '');
    setParams(initialParams(def, content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const { mutate, loading } = useMutation(
    (body: { content: Record<string, unknown>; displayOrder: number; isActive: boolean }) =>
      api.patch(`/landing/${def.sectionKey}`, body),
  );

  // Sin fila en D1 (migración pendiente) no hay nada que editar.
  if (!section) {
    return (
      <Card className="p-4">
        <p className="text-xs text-text-muted">
          "{def.heading}" no está disponible todavía (falta aplicar migraciones).
        </p>
      </Card>
    );
  }

  async function handleSave() {
    const numeric: Record<string, number> = {};
    for (const p of def.params) {
      const n = Number(params[p.key]);
      if (Number.isFinite(n) && n >= 1) numeric[p.key] = Math.trunc(n);
    }
    const orderNumber = Number(order);
    const result = await mutate({
      content: { ...(title.trim() ? { title: title.trim() } : {}), ...numeric },
      displayOrder: Number.isFinite(orderNumber) ? Math.trunc(orderNumber) : (section?.displayOrder ?? 0),
      isActive: active,
    });
    if (result !== undefined) {
      toastSuccess(`"${def.heading}" actualizada`);
      onSaved();
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text">{def.heading}</p>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-4 accent-primary"
          />
          Activa
        </label>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextField
          label="Orden"
          type="number"
          min={0}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />
        {def.params.map((p) => (
          <TextField
            key={p.key}
            label={p.label}
            type="number"
            min={1}
            value={params[p.key] ?? ''}
            onChange={(e) => setParams((prev) => ({ ...prev, [p.key]: e.target.value }))}
          />
        ))}
      </div>
      <Button type="button" loading={loading} className="self-start" onClick={handleSave}>
        Guardar
      </Button>
    </Card>
  );
}

function initialParams(def: SectionDef, content: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    def.params.map((p) => [p.key, content[p.key] != null ? String(content[p.key]) : '']),
  );
}
