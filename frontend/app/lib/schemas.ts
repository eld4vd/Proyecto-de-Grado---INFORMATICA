import { z } from 'zod';

// ─── Registro ────────────────────────────────────────────────
export const registroSchema = z.object({
  nombre: z.string().trim()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().trim()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().trim()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener mayúscula, minúscula y número'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
  telefono: z.string().trim()
    .min(1, 'El teléfono es requerido')
    .regex(/^\+?[\d\s\-()]+$/, 'Teléfono inválido'),
  nitCi: z.string().trim()
    .min(1, 'El NIT/CI es requerido')
    .min(4, 'NIT/CI debe tener al menos 4 caracteres'),
  acceptTerms: z.literal(true, { message: 'Debes aceptar los términos y condiciones' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type RegistroFormData = z.infer<typeof registroSchema>;

// ─── Login ───────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().trim()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Checkout: Paso 1 — Dirección ───────────────────────────
export const checkoutDireccionExistenteSchema = z.object({
  direccionId: z.string().min(1, 'Selecciona una dirección de envío'),
});

export const checkoutNuevaDireccionSchema = z.object({
  calle: z.string().trim().min(1, 'La dirección es requerida'),
  ciudad: z.string().trim().min(1, 'La ciudad es requerida'),
  departamento: z.string().min(1, 'El departamento es requerido'),
});

// ─── Checkout: Paso 2 — Pago con tarjeta ────────────────────
export const checkoutTarjetaSchema = z.object({
  numeroTarjeta: z.string()
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().length(16, 'El número de tarjeta debe tener 16 dígitos')),
  nombreTarjeta: z.string().trim().min(1, 'El nombre del titular es requerido'),
  expiracion: z.string().length(5, 'La fecha de expiración es inválida'),
  cvv: z.string().min(3, 'El CVV es inválido'),
});

// ─── Utilidad para extraer errores por campo ─────────────────
export function flattenErrors(result: { success: true } | { success: false; error: z.ZodError }): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
