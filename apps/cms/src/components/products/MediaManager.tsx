import { useRef, useState, type ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Upload } from 'lucide-react';
import type { ProductMedia } from '@jaw/shared';
import { useMutation } from '../../hooks/useMutation';
import { api } from '../../lib/api';
import { mediaUrl } from '../../lib/format';
import { toastSuccess } from '../../store/toastStore';
import { Button } from '../ui/Button';

interface MediaManagerProps {
  productId: number;
  media: ProductMedia[];
  onChange: () => void;
}

/** Subida y reordenamiento de imágenes/video a R2 (spec §11). */
export function MediaManager({ productId, media, onChange }: MediaManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { mutate: remove } = useMutation((id: number) => api.delete(`/media/${id}`));
  const { mutate: reorder } = useMutation((id: number, displayOrder: number) =>
    api.patch(`/media/${id}/order`, { displayOrder }),
  );

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/products/${productId}/media`, formData);
      toastSuccess('Media subida');
      onChange();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove(id: number) {
    if (!window.confirm('¿Eliminar esta imagen/video?')) return;
    const result = await remove(id);
    if (result !== undefined) {
      toastSuccess('Media eliminada');
      onChange();
    }
  }

  async function handleMove(item: ProductMedia, direction: -1 | 1) {
    const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex((m) => m.id === item.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    await Promise.all([
      reorder(item.id, swapWith.displayOrder),
      reorder(swapWith.id, item.displayOrder),
    ]);
    onChange();
  }

  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {sorted.map((item, i) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-xl border-2 border-border bg-border"
          >
            {item.type === 'video' ? (
              <video src={mediaUrl(item.r2Key)} className="h-full w-full object-cover" muted />
            ) : (
              <img src={mediaUrl(item.r2Key)} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface-dark/0 opacity-0 transition-opacity group-hover:bg-surface-dark/60 group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => handleMove(item, -1)}
                  aria-label="Mover antes"
                  className="rounded-lg bg-white/90 p-1.5 text-forest disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={i === sorted.length - 1}
                  onClick={() => handleMove(item, 1)}
                  aria-label="Mover después"
                  className="rounded-lg bg-white/90 p-1.5 text-forest disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                aria-label="Eliminar media"
                className="flex items-center gap-1 rounded-lg bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground"
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
          id="media-upload"
        />
        <Button
          type="button"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          Subir imagen/video
        </Button>
      </div>
    </div>
  );
}
