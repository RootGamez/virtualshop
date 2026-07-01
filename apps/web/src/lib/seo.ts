import { useEffect } from 'react';
import { BRAND } from '@virtualshop/shared';

/**
 * SEO básico sin dependencias externas (spec §12): título semántico + meta
 * description por página. Nada de "VirtualShop" hardcodeado: siempre vía BRAND.
 */
export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} · ${BRAND.name}` : BRAND.name;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    let previousDescription: string | null = null;
    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      previousDescription = meta.content;
      meta.content = description;
    }

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) meta.content = previousDescription;
    };
  }, [title, description]);
}
