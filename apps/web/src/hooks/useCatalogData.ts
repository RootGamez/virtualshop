import type {
  Category,
  CategorySection,
  LandingConfig,
  PaginatedResult,
  Product,
  ProductDetail,
  WhatsappConfig,
} from '@jaw/shared';
import { api } from '../lib/api';
import { useAsync } from './useAsync';

export function useCategories() {
  return useAsync<Category[]>(() => api.get('/categories'), []);
}

/** Catálogo por secciones: categorías con una muestra de sus productos activos. */
export function useCatalogSections() {
  return useAsync<CategorySection[]>(() => api.get('/categories/sections'), []);
}

export function useProducts(params: { categoryId?: number; search?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params.categoryId) query.set('categoryId', String(params.categoryId));
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  const qs = query.toString();

  return useAsync<PaginatedResult<Product>>(
    () => api.get(`/products${qs ? `?${qs}` : ''}`),
    [params.categoryId, params.search, params.page],
  );
}

/** Best sellers por order_click en los últimos `days` días. */
export function useBestSellers(params: { days?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params.days) query.set('days', String(params.days));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return useAsync<Product[]>(
    () => api.get(`/products/best-sellers${qs ? `?${qs}` : ''}`),
    [params.days, params.limit],
  );
}

/** Productos activos con stock total bajo (la API nunca expone el número). */
export function useLowStock(params: { threshold?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params.threshold) query.set('threshold', String(params.threshold));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return useAsync<Product[]>(
    () => api.get(`/products/low-stock${qs ? `?${qs}` : ''}`),
    [params.threshold, params.limit],
  );
}

export function useProduct(slug: string | undefined) {
  return useAsync<ProductDetail>(() => {
    if (!slug) return Promise.reject(new Error('slug requerido'));
    return api.get(`/products/${slug}`);
  }, [slug]);
}

export function useLanding() {
  return useAsync<LandingConfig[]>(() => api.get('/landing'), []);
}

export function useWhatsappConfig() {
  return useAsync<WhatsappConfig>(() => api.get('/whatsapp'), []);
}
