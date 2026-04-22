/**
 * Barrel file para iconos más usados (Phosphor Icons)
 * Vercel Best Practice: bundle-barrel-files
 * 
 * Centraliza los iconos más frecuentes para mejor tree-shaking
 * y organización del código.
 * 
 * Uso:
 * import { Envelope, Lock, SpinnerGap } from '@/app/lib/icons';
 */

// Iconos de UI general
export {
  // Navegación
  ArrowRight,
  ArrowLeft,
  CaretRight,
  CaretLeft,
  CaretDown,
  CaretUp,
  House,
  List,
  X,
  
  // Acciones
  Plus,
  Minus,
  PencilSimple,
  Trash,
  Check,
  MagnifyingGlass,
  
  // Estados
  SpinnerGap,
  WarningCircle,
  CheckCircle,
  XCircle,
  Info,
  
  // Usuario y Auth
  User,
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  Shield,
  Phone,
  
  // E-commerce
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Package,
  Truck,
  Heart,
  Star,
  Percent,
  
  // Ubicación
  MapPin,
  
  // Tecnología
  Laptop,
  Lightning,
  
  // Tiempo
  Clock,
  
  // Documentos
  IdentificationCard,
  
  // Social/Contacto
  UserPlus,
  SignOut,
  Gear,
  
  // Seguridad
  ShieldCheck,
  
} from '@phosphor-icons/react';

// Tipos para iconos (útil para componentes genéricos)
export type { Icon } from '@phosphor-icons/react';
