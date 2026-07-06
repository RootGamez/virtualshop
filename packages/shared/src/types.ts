/**
 * Tipos base del dominio, en espejo del modelo de datos (spec §5).
 * Reflejan las columnas de D1 tal cual, en camelCase.
 */

export type Role = 'owner' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  /** Último login exitoso (null si nunca inició sesión desde que existe la columna). */
  lastLoginAt: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: string;
  /** Clave R2 del banner de la categoría (opcional, gestionado desde el CMS). */
  bannerImageKey?: string | null;
}

export type DiscountType = 'percent' | 'fixed' | null;

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  discountType: DiscountType;
  discountValue: number | null;
  finalPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Clave R2 de la imagen de portada (primera media). Se incluye en el listado del catálogo. */
  coverImageKey?: string | null;
  /** Suma de stock de todas las variantes. Se incluye en el listado del catálogo. */
  totalStock?: number;
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string;
  stock: number;
  createdAt: string;
}

export type MediaType = 'image' | 'video';

export interface ProductMedia {
  id: number;
  productId: number;
  type: MediaType;
  r2Key: string;
  displayOrder: number;
  createdAt: string;
}

export interface LandingConfig {
  id: number;
  sectionKey: string;
  content: Record<string, unknown>;
  displayOrder: number;
  isActive: boolean;
}

export interface WhatsappConfig {
  id: number;
  phoneNumber: string;
  messageTemplate: string;
  updatedAt: string;
}

export type EventType = 'view' | 'order_click';

export interface AnalyticsEvent {
  id: number;
  productId: number;
  type: EventType;
  createdAt: string;
}

/** Producto con sus relaciones cargadas, como lo devuelve GET /products/:slug */
export interface ProductDetail extends Product {
  variants: ProductVariant[];
  media: ProductMedia[];
  category: Pick<Category, 'id' | 'name' | 'slug'>;
}
