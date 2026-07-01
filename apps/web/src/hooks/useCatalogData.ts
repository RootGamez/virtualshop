import type {
  Category,
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
