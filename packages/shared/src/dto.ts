/**
 * Contratos de request/response de la API (spec §8).
 * Web, CMS y API importan estos tipos para no desincronizarse.
 */
import type { Category, DiscountType, Product } from './types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  displayOrder?: number;
}

export interface CreateProductInput {
  categoryId: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateVariantInput {
  size: string;
  color: string;
  stock: number;
}

export interface UpdateVariantInput {
  size?: string;
  color?: string;
  stock?: number;
}

export interface PaginatedQuery {
  page?: number;
  pageSize?: number;
}

export interface ProductListQuery extends PaginatedQuery {
  categoryId?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Sección del catálogo: una categoría con una muestra de sus productos
 * activos (respuesta de GET /categories/sections). Las categorías sin
 * productos activos no se incluyen.
 */
export interface CategorySection {
  category: Category;
  products: Product[];
}

/**
 * Secciones de merchandising del catálogo. Su configuración vive en
 * landing_config bajo estas claves; `content` sigue los shapes de abajo.
 */
export const CATALOG_SECTION_KEYS = {
  drops: 'catalog_drops',
  bestSellers: 'catalog_best_sellers',
  lowStock: 'catalog_low_stock',
} as const;

export type CatalogSectionKey = (typeof CATALOG_SECTION_KEYS)[keyof typeof CATALOG_SECTION_KEYS];

export interface CatalogDropsConfig {
  title?: string;
  /** Un producto es "NUEVO" si su createdAt cae dentro de esta ventana. */
  windowDays?: number;
  limit?: number;
}

export interface CatalogBestSellersConfig {
  title?: string;
  /** Ventana de conteo de order_click, en días. */
  days?: number;
  limit?: number;
}

export interface CatalogLowStockConfig {
  title?: string;
  /** Stock total <= threshold dispara la urgencia (nunca se expone el número). */
  threshold?: number;
  limit?: number;
}

export interface RegisterEventInput {
  productId: number;
  type: 'view' | 'order_click';
}

export interface ReportDateRangeQuery {
  from?: string; // ISO date
  to?: string; // ISO date
}
