import type {
  Category,
  LandingConfig,
  PaginatedResult,
  Product,
  ProductDetail,
  ProductVariant,
  User,
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

export function useProductDetail(idOrSlug: string | undefined) {
  return useAsync<ProductDetail>(() => {
    if (!idOrSlug) return Promise.reject(new Error('id requerido'));
    return api.get(`/products/${idOrSlug}`);
  }, [idOrSlug]);
}

export function useVariants(productId: number | undefined) {
  return useAsync<ProductVariant[]>(() => {
    if (!productId) return Promise.resolve([]);
    return api.get(`/products/${productId}/variants`);
  }, [productId]);
}

export function useLanding() {
  return useAsync<LandingConfig[]>(() => api.get('/landing'), []);
}

export function useWhatsappConfig() {
  return useAsync<WhatsappConfig>(() => api.get('/whatsapp'), []);
}

export function useUsers() {
  return useAsync<User[]>(() => api.get('/users'), []);
}
