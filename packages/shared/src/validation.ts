/**
 * Esquemas de validación (Zod) para los contratos de request de la API (spec §8).
 * Fuente única compartida: la API valida al persistir y el CMS puede reusarlos
 * para validar formularios antes de enviar. Acotan reglas de negocio que el
 * modelo de datos por sí solo no garantiza (precio > 0, 0 ≤ % ≤ 100, etc.).
 */
import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const loginSchema = z.object({
  email: z.string().email('email inválido'),
  password: z.string().min(1, 'password requerido'),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'name requerido'),
  slug: z.string().regex(slugRegex, 'slug inválido (usar minúsculas y guiones)'),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

const discountTypeSchema = z.enum(['percent', 'fixed']).nullable().optional();

export const createProductSchema = z
  .object({
    categoryId: z.number().int().positive('categoryId inválido'),
    name: z.string().min(1, 'name requerido'),
    description: z.string().default(''),
    slug: z.string().regex(slugRegex, 'slug inválido').optional(),
    price: z.number().positive('price debe ser mayor a 0'),
    discountType: discountTypeSchema,
    discountValue: z.number().nonnegative().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'percent' && data.discountValue != null && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'el porcentaje no puede superar 100',
      });
    }
    if (data.discountType === 'fixed' && data.discountValue != null && data.discountValue > data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'el descuento fijo no puede superar el precio',
      });
    }
  });

export const updateProductSchema = z
  .object({
    categoryId: z.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    slug: z.string().regex(slugRegex, 'slug inválido').optional(),
    price: z.number().positive().optional(),
    discountType: discountTypeSchema,
    discountValue: z.number().nonnegative().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .partial()
  .superRefine((data, ctx) => {
    // En update el precio puede no venir (se usa el actual), así que solo se
    // valida el porcentaje, que no depende del precio. El caso 'fixed' ya es
    // seguro porque fromFixedAmount acota el precio final a 0.
    if (data.discountType === 'percent' && data.discountValue != null && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'el porcentaje no puede superar 100',
      });
    }
  });

export const createVariantSchema = z.object({
  size: z.string().min(1, 'size requerido'),
  color: z.string().min(1, 'color requerido'),
  stock: z.number().int().min(0, 'stock no puede ser negativo').optional(),
});

export const updateVariantSchema = z.object({
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
});

export const mediaOrderSchema = z.object({
  displayOrder: z.number().int().min(0, 'displayOrder no puede ser negativo'),
});

export const registerEventSchema = z.object({
  productId: z.number().int().positive('productId inválido'),
  type: z.enum(['view', 'order_click']),
});

export const createUserSchema = z.object({
  email: z.string().email('email inválido'),
  password: z.string().min(8, 'la contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'name requerido'),
  role: z.enum(['owner', 'admin']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['owner', 'admin']).optional(),
  password: z.string().min(8, 'la contraseña debe tener al menos 8 caracteres').optional(),
});

export const whatsappUpdateSchema = z.object({
  phoneNumber: z.string().min(1).optional(),
  messageTemplate: z.string().min(1).optional(),
});
