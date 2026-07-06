/**
 * Filas tal cual las devuelve D1 (snake_case) y mappers a los tipos de dominio
 * (camelCase, en @jaw/shared). D1 no tiene ORM: se mapea a mano.
 */
import type {
  AnalyticsEvent,
  Category,
  LandingConfig,
  Product,
  ProductMedia,
  ProductVariant,
  User,
  WhatsappConfig,
} from '@jaw/shared';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'admin';
  created_at: string;
  /** Se incrementa al cambiar la contraseña: invalida los JWT firmados con la versión anterior. */
  token_version: number;
  last_login_at: string | null;
}
export const mapUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  createdAt: r.created_at,
  lastLoginAt: r.last_login_at,
});

export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
  banner_image_key: string | null;
}
export const mapCategory = (r: CategoryRow): Category => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  displayOrder: r.display_order,
  createdAt: r.created_at,
  bannerImageKey: r.banner_image_key,
});

export interface ProductRow {
  id: number;
  category_id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  discount_type: 'percent' | 'fixed' | null;
  discount_value: number | null;
  final_price: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}
export const mapProduct = (r: ProductRow): Product => ({
  id: r.id,
  categoryId: r.category_id,
  name: r.name,
  description: r.description,
  slug: r.slug,
  price: r.price,
  discountType: r.discount_type,
  discountValue: r.discount_value,
  finalPrice: r.final_price,
  isActive: Boolean(r.is_active),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface VariantRow {
  id: number;
  product_id: number;
  size: string;
  color: string;
  stock: number;
  created_at: string;
}
export const mapVariant = (r: VariantRow): ProductVariant => ({
  id: r.id,
  productId: r.product_id,
  size: r.size,
  color: r.color,
  stock: r.stock,
  createdAt: r.created_at,
});

export interface MediaRow {
  id: number;
  product_id: number;
  type: 'image' | 'video';
  r2_key: string;
  display_order: number;
  created_at: string;
}
export const mapMedia = (r: MediaRow): ProductMedia => ({
  id: r.id,
  productId: r.product_id,
  type: r.type,
  r2Key: r.r2_key,
  displayOrder: r.display_order,
  createdAt: r.created_at,
});

export interface LandingRow {
  id: number;
  section_key: string;
  content: string; // JSON crudo
  display_order: number;
  is_active: number;
}
export const mapLanding = (r: LandingRow): LandingConfig => ({
  id: r.id,
  sectionKey: r.section_key,
  content: JSON.parse(r.content) as Record<string, unknown>,
  displayOrder: r.display_order,
  isActive: Boolean(r.is_active),
});

export interface WhatsappRow {
  id: number;
  phone_number: string;
  message_template: string;
  updated_at: string;
}
export const mapWhatsapp = (r: WhatsappRow): WhatsappConfig => ({
  id: r.id,
  phoneNumber: r.phone_number,
  messageTemplate: r.message_template,
  updatedAt: r.updated_at,
});

export interface EventRow {
  id: number;
  product_id: number;
  type: 'view' | 'order_click';
  created_at: string;
}
export const mapEvent = (r: EventRow): AnalyticsEvent => ({
  id: r.id,
  productId: r.product_id,
  type: r.type,
  createdAt: r.created_at,
});
