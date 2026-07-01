/**
 * Contratos de request/response de la API (spec §8).
 * Web, CMS y API importan estos tipos para no desincronizarse.
 */
import type { DiscountType } from './types';

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

export interface RegisterEventInput {
  productId: number;
  type: 'view' | 'order_click';
}

export interface ReportDateRangeQuery {
  from?: string; // ISO date
  to?: string; // ISO date
}
