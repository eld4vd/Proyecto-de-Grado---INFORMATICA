'use client';

import { useState, useEffect, Suspense, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Envelope, Phone, MapPin, Package, Heart, Gear, SignOut, CaretRight, PencilSimple, Plus, Trash, Lock, Eye, EyeSlash, Check, X, WarningCircle, CircleNotch, House, Bag, CreditCard, Truck, CheckCircle, Clock, XCircle } from '@phosphor-icons/react';
import { getProfile, User as UserType } from '../lib/auth';
import { useAuth } from '../lib/auth-context';
import { useFavoritos } from '../lib/favoritos-context';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

// Tipos
interface Direccion {
  id: string;
  calle: string;
  ciudad: string;
  departamento: string;
  codigoPostal?: string;
  esPredeterminada: boolean;
}

interface OrdenItem {
  id: string;
  cantidad: number;
  precioUnitario: number | string;
  nombreProducto: string;
  producto: {
    id: string;
    nombre: string;
    imagenes: { url: string; esPrincipal: boolean }[];
  };
}

interface Orden {
  id: string;
  numeroOrden: string;
  total: number;
  estado: string;
  estadoPago: string;
  createdAt: string;
  items?: OrdenItem[];
  _count?: { items: number };
}

interface ProfileData {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  nitCi?: string;
  role: string;
  createdAt: string;
  _count?: {
    ordenes: number;
    direcciones: number;
  };
}

type ActiveTab = 'perfil' | 'direcciones' | 'pedidos' | 'favoritos' | 'seguridad';

const validTabs: ActiveTab[] = ['perfil', 'direcciones', 'pedidos', 'favoritos', 'seguridad'];

function CuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast: showGlobalToast } = useToast();
  const { logout } = useAuth();
  const { favoritos, loading: loadingFavoritos, toggleFavorito, refreshFavoritos } = useFavoritos();
  const [user, setUser] = useState<UserType | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [favoritosLoaded, setFavoritosLoaded] = useState(false);

  // Leer tab de la URL
  const tabParam = searchParams.get('tab') as ActiveTab | null;
  const activeTab: ActiveTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'perfil';

  // Función para cambiar de tab actualizando la URL
  const setActiveTab = (tab: ActiveTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'perfil') {
      params.delete('tab'); // perfil es el default, no necesita param
    } else {
      params.set('tab', tab);
    }
    const queryString = params.toString();
    router.push(`/cuenta${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    nitCi: '',
  });

  // Estados para cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Estados para direcciones
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    calle: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    esPredeterminada: false,
  });

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Cargar favoritos cuando se abre esa tab
  useEffect(() => {
    if (activeTab === 'favoritos' && !favoritosLoaded) {
      refreshFavoritos();
      setFavoritosLoaded(true);
    }
  }, [activeTab, favoritosLoaded, refreshFavoritos]);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        const profileData = await getProfile();
        if (!profileData) {
          router.push('/login?redirect=/cuenta');
          return;
        }
        setUser(profileData);

        // Cargar perfil completo
        const profileRes = await fetch('/api/auth/profile', { credentials: 'include' });
        if (profileRes.ok) {
          const fullProfile = await profileRes.json();
          setProfile(fullProfile);
          setProfileForm({
            nombre: fullProfile.nombre || '',
            apellido: fullProfile.apellido || '',
            telefono: fullProfile.telefono || '',
            nitCi: fullProfile.nitCi || '',
          });

          // Cargar direcciones y órdenes en paralelo (optimización async-parallel)
          const [dirRes, ordRes] = await Promise.all([
            fetch(`/api/direcciones/cliente/${fullProfile.id}`, { credentials: 'include' }),
            fetch(`/api/ordenes/cliente/${fullProfile.id}`, { credentials: 'include' }),
          ]);

          if (dirRes.ok) {
            setDirecciones(await dirRes.json());
          }
          if (ordRes.ok) {
            setOrdenes(await ordRes.json());
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        router.push('/login?redirect=/cuenta');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  // useTransition para operaciones async - mejor UX
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();
  const [isPendingAddress, startAddressTransition] = useTransition();
  const [isPendingLogout, startLogoutTransition] = useTransition();

  // Guardar perfil con useCallback y useTransition
  const handleSaveProfile = useCallback(async () => {
    startProfileTransition(async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(profileForm),
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(prev => prev ? { ...prev, ...data.user } : null);
          setIsEditingProfile(false);
          setToast({ type: 'success', message: 'Perfil actualizado correctamente' });
        } else {
          const error = await res.json();
          setToast({ type: 'error', message: error.message || 'Error al actualizar perfil' });
        }
      } catch {
        setToast({ type: 'error', message: 'Error de conexión' });
      }
    });
  }, [profileForm]);

  // Cambiar contraseña con useCallback y useTransition
  const handleChangePassword = useCallback(async () => {
    // Early return - validaciones
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setToast({ type: 'error', message: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    startPasswordTransition(async () => {
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(passwordForm),
        });

        if (res.ok) {
          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setToast({ type: 'success', message: 'Contraseña cambiada correctamente' });
        } else {
          const error = await res.json();
          setToast({ type: 'error', message: error.message || 'Error al cambiar contraseña' });
        }
      } catch {
        setToast({ type: 'error', message: 'Error de conexión' });
      }
    });
  }, [passwordForm]);

  // Guardar dirección con useCallback y useTransition
  const handleSaveAddress = useCallback(async () => {
    if (!profile) return;

    startAddressTransition(async () => {
      try {
        const url = editingAddressId 
          ? `/api/direcciones/${editingAddressId}`
          : '/api/direcciones';
        
        const res = await fetch(url, {
          method: editingAddressId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...addressForm,
            clienteId: profile.id,
          }),
        });

        if (res.ok) {
          // Recargar direcciones
          const dirRes = await fetch(`/api/direcciones/cliente/${profile.id}`, { credentials: 'include' });
          if (dirRes.ok) {
            setDirecciones(await dirRes.json());
          }
          setIsAddingAddress(false);
          setEditingAddressId(null);
          setAddressForm({ calle: '', ciudad: '', departamento: '', codigoPostal: '', esPredeterminada: false });
          setToast({ type: 'success', message: editingAddressId ? 'Dirección actualizada' : 'Dirección agregada' });
      } else {
        const error = await res.json();
        setToast({ type: 'error', message: error.message || 'Error al guardar dirección' });
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión' });
    }
    });
  }, [profile, editingAddressId, addressForm]);

  // Eliminar dirección con useCallback
  const handleDeleteAddress = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;
    if (!profile) return;

    startAddressTransition(async () => {
      try {
        const res = await fetch(`/api/direcciones/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (res.ok) {
          setDirecciones(prev => prev.filter(d => d.id !== id));
          setToast({ type: 'success', message: 'Dirección eliminada' });
        } else {
          setToast({ type: 'error', message: 'Error al eliminar dirección' });
        }
      } catch {
        setToast({ type: 'error', message: 'Error de conexión' });
      }
    });
  }, [profile]);

  // Cerrar sesión - mostrar confirmación
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    const userName = profile?.nombre || user?.nombre || 'Usuario';
    setShowLogoutConfirm(false);
    
    startLogoutTransition(async () => {
      // Mostrar toast de "Cerrando sesión..."
      showGlobalToast({
        type: 'info',
        title: 'Cerrando sesión...',
        message: 'Por favor espera un momento.',
        duration: 1500,
      });
      
      // Esperar 1 segundo antes de cerrar sesión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await logout();
      
      // Mostrar toast de despedida
      showGlobalToast({
        type: 'success',
        title: '¡Hasta pronto!',
        message: `${userName}, tu sesión se ha cerrado correctamente.`,
        duration: 4000,
      });
      
      router.push('/');
      router.refresh();
    });
  }, [profile, user, logout, showGlobalToast, router]);

  // Editar dirección con useCallback
  const startEditAddress = useCallback((dir: Direccion) => {
    setEditingAddressId(dir.id);
    setAddressForm({
      calle: dir.calle,
      ciudad: dir.ciudad,
      departamento: dir.departamento,
      codigoPostal: dir.codigoPostal || '',
      esPredeterminada: dir.esPredeterminada,
    });
    setIsAddingAddress(true);
  }, []);

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Estado de orden
  const getEstadoOrden = (estado: string) => {
    const estados: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      PENDIENTE: { color: 'text-yellow-400', icon: <Clock size={16} />, label: 'Pendiente' },
      CONFIRMADO: { color: 'text-blue-400', icon: <CheckCircle size={16} />, label: 'Confirmado' },
      EN_PROCESO: { color: 'text-purple-400', icon: <Package size={16} />, label: 'En proceso' },
      ENVIADO: { color: 'text-cyan-400', icon: <Truck size={16} />, label: 'Enviado' },
      ENTREGADO: { color: 'text-accent', icon: <Check size={16} />, label: 'Entregado' },
      CANCELADO: { color: 'text-red-400', icon: <XCircle size={16} />, label: 'Cancelado' },
    };
    return estados[estado] || { color: 'text-content-secondary', icon: <Clock size={16} />, label: estado };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <CircleNotch size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const tabs = [
    { id: 'perfil' as ActiveTab, label: 'Mi Perfil', icon: User },
    { id: 'direcciones' as ActiveTab, label: 'Direcciones', icon: MapPin },
    { id: 'pedidos' as ActiveTab, label: 'Mis Pedidos', icon: Package },
    { id: 'favoritos' as ActiveTab, label: 'Favoritos', icon: Heart },
    { id: 'seguridad' as ActiveTab, label: 'Seguridad', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-surface-deep relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 size-125 bg-accent/3 rounded-full blur-[200px] pointer-events-none" />
      
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 max-w-md shadow-2xl border ${
            toast.type === 'error'
              ? 'bg-danger/95 border-danger text-white'
              : 'bg-accent/95 border-accent text-accent-contrast'
          }`}>
            {toast.type === 'error' ? (
              <WarningCircle size={20} className="shrink-0" />
            ) : (
              <CheckCircle size={20} className="shrink-0" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="container-custom py-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-content-muted mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
          <CaretRight size={16} />
          <span className="text-accent">Mi Cuenta</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-accent/10 border border-accent/30 flex items-center justify-center">
              <User size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-content">Mi Cuenta</h1>
              <p className="text-content-secondary">
                Bienvenido, <span className="text-accent">{profile.nombre} {profile.apellido}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="group flex items-center gap-2 px-4 py-2 bg-surface-hover border border-line-med text-content-secondary hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            <SignOut size={16} className="group-hover:scale-110 transition-transform" />
            Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line p-6 relative overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
              
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="size-20 bg-linear-to-br from-accent to-accent-hover flex items-center justify-center mb-3 relative group">
                  <span className="text-3xl font-bold text-accent-contrast relative z-10">
                    {profile.nombre.charAt(0)}{profile.apellido.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
                <h3 className="font-semibold text-content">{profile.nombre} {profile.apellido}</h3>
                <p className="text-sm text-content-muted">{profile.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-surface-raised border border-line p-3 text-center hover:border-accent/30 transition-colors">
                  <p className="text-2xl font-bold text-accent">{profile._count?.ordenes || 0}</p>
                  <p className="text-xs text-content-muted">Pedidos</p>
                </div>
                <div className="bg-surface-raised border border-line p-3 text-center hover:border-accent/30 transition-colors">
                  <p className="text-2xl font-bold text-accent">{direcciones.length}</p>
                  <p className="text-xs text-content-muted">Direcciones</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-accent/10 text-accent border-l-2 border-accent'
                        : 'text-content-secondary hover:text-content hover:bg-surface-raised'
                    }`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Member since */}
              <div className="mt-6 pt-6 border-t border-line">
                <p className="text-xs text-content-muted text-center">
                  Miembro desde {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Tab: Perfil */}
            {activeTab === 'perfil' && (
              <div className="bg-surface border border-line p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-content">Información Personal</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-contrast font-medium hover:bg-accent-hover transition-colors"
                    >
                      <PencilSimple size={16} />
                      Editar
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cuenta-nombre" className="block text-sm text-content-secondary mb-2">Nombre</label>
                        <input
                          id="cuenta-nombre"
                          type="text"
                          value={profileForm.nombre}
                          onChange={e => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                          autoComplete="given-name"
                          className="w-full px-4 py-3 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="cuenta-apellido" className="block text-sm text-content-secondary mb-2">Apellido</label>
                        <input
                          id="cuenta-apellido"
                          type="text"
                          value={profileForm.apellido}
                          onChange={e => setProfileForm(prev => ({ ...prev, apellido: e.target.value }))}
                          autoComplete="family-name"
                          className="w-full px-4 py-3 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cuenta-telefono" className="block text-sm text-content-secondary mb-2">Teléfono</label>
                        <input
                          id="cuenta-telefono"
                          type="tel"
                          value={profileForm.telefono}
                          onChange={e => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                          autoComplete="tel"
                          className="w-full px-4 py-3 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
                          placeholder="+591 70000000"
                        />
                      </div>
                      <div>
                        <label htmlFor="cuenta-nitci" className="block text-sm text-content-secondary mb-2">NIT/CI</label>
                        <input
                          id="cuenta-nitci"
                          type="text"
                          value={profileForm.nitCi}
                          onChange={e => setProfileForm(prev => ({ ...prev, nitCi: e.target.value }))}
                          autoComplete="off"
                          className="w-full px-4 py-3 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
                          placeholder="12345678"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isPendingProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                      >
                        {isPendingProfile ? <CircleNotch size={16} className="animate-spin" /> : <Check size={16} />}
                        Guardar cambios
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileForm({
                            nombre: profile.nombre || '',
                            apellido: profile.apellido || '',
                            telefono: profile.telefono || '',
                            nitCi: profile.nitCi || '',
                          });
                        }}
                        className="px-6 py-3 border border-line-med text-content-secondary hover:text-content hover:border-gray-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-surface-raised border border-line">
                        <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <User size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-content-muted">Nombre completo</p>
                          <p className="text-content font-medium">{profile.nombre} {profile.apellido}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-raised border border-line">
                        <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Envelope size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-content-muted">Email</p>
                          <p className="text-content font-medium">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-raised border border-line">
                        <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Phone size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-content-muted">Teléfono</p>
                          <p className="text-content font-medium">{profile.telefono || 'No especificado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-surface-raised border border-line">
                        <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <CreditCard size={20} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-content-muted">NIT/CI</p>
                          <p className="text-content font-medium">{profile.nitCi || 'No especificado'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Direcciones */}
            {activeTab === 'direcciones' && (
              <div className="bg-surface border border-line p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-content">Mis Direcciones</h2>
                  {!isAddingAddress && (
                    <button
                      onClick={() => {
                        setIsAddingAddress(true);
                        setEditingAddressId(null);
                        setAddressForm({ calle: '', ciudad: '', departamento: '', codigoPostal: '', esPredeterminada: false });
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-contrast font-medium hover:bg-accent-hover transition-colors"
                    >
                      <Plus size={16} />
                      Agregar dirección
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <div className="space-y-4 p-4 bg-surface-raised border border-line-med">
                    <h3 className="font-semibold text-content mb-4">
                      {editingAddressId ? 'Editar dirección' : 'Nueva dirección'}
                    </h3>
                    <div>
                      <label htmlFor="cuenta-calle" className="block text-sm text-content-secondary mb-2">Calle y número</label>
                      <input
                        id="cuenta-calle"
                        type="text"
                        value={addressForm.calle}
                        onChange={e => setAddressForm(prev => ({ ...prev, calle: e.target.value }))}
                        autoComplete="street-address"
                        className="w-full px-4 py-3 bg-surface border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        placeholder="Av. Principal #123"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cuenta-ciudad" className="block text-sm text-content-secondary mb-2">Ciudad</label>
                        <input
                          id="cuenta-ciudad"
                          type="text"
                          value={addressForm.ciudad}
                          onChange={e => setAddressForm(prev => ({ ...prev, ciudad: e.target.value }))}
                          autoComplete="address-level2"
                          className="w-full px-4 py-3 bg-surface border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                          placeholder="Sucre"
                        />
                      </div>
                      <div>
                        <label htmlFor="cuenta-departamento" className="block text-sm text-content-secondary mb-2">Departamento</label>
                        <select
                          id="cuenta-departamento"
                          value={addressForm.departamento}
                          onChange={e => setAddressForm(prev => ({ ...prev, departamento: e.target.value }))}
                          autoComplete="address-level1"
                          className="w-full px-4 py-3 bg-surface border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Sucre">Sucre</option>
                          <option value="La Paz">La Paz</option>
                          <option value="Cochabamba">Cochabamba</option>
                          <option value="Tarija">Tarija</option>
                          <option value="Oruro">Oruro</option>
                          <option value="Potosí">Potosí</option>
                          <option value="Chuquisaca">Chuquisaca</option>
                          <option value="Beni">Beni</option>
                          <option value="Pando">Pando</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cuenta-codigoPostal" className="block text-sm text-content-secondary mb-2">Código postal (opcional)</label>
                        <input
                          id="cuenta-codigoPostal"
                          type="text"
                          value={addressForm.codigoPostal}
                          onChange={e => setAddressForm(prev => ({ ...prev, codigoPostal: e.target.value }))}
                          autoComplete="postal-code"
                          className="w-full px-4 py-3 bg-surface border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.esPredeterminada}
                            onChange={e => setAddressForm(prev => ({ ...prev, esPredeterminada: e.target.checked }))}
                          className="size-5 accent-accent"
                          />
                          <span className="text-content-bright">Usar como dirección principal</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveAddress}
                        disabled={isPendingAddress || !addressForm.calle || !addressForm.ciudad || !addressForm.departamento}
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
                      >
                        {isPendingAddress ? <CircleNotch size={16} className="animate-spin" /> : <Check size={16} />}
                        {editingAddressId ? 'Actualizar' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingAddress(false);
                          setEditingAddressId(null);
                        }}
                        className="px-6 py-3 border border-line-med text-content-secondary hover:text-content hover:border-gray-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : direcciones.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin size={48} className="text-content-faint mx-auto mb-4" />
                    <p className="text-content-secondary mb-4">No tienes direcciones guardadas</p>
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="text-accent hover:underline"
                    >
                      Agregar tu primera dirección
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {direcciones.map(dir => (
                      <div
                        key={dir.id}
                        className={`p-4 bg-surface-raised border ${dir.esPredeterminada ? 'border-accent' : 'border-line'} relative`}
                      >
                        {dir.esPredeterminada && (
                          <span className="absolute top-3 right-3 text-xs px-2 py-1 bg-accent/20 text-accent font-medium">
                            Principal
                          </span>
                        )}
                        <div className="flex items-start gap-4">
                          <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                            <House size={20} className="text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-content font-medium">{dir.calle}</p>
                            <p className="text-content-secondary text-sm">
                              {dir.ciudad}, {dir.departamento}
                              {dir.codigoPostal && ` - ${dir.codigoPostal}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditAddress(dir)}
                              className="p-2 text-content-secondary hover:text-accent transition-colors"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(dir.id)}
                              className="p-2 text-content-secondary hover:text-red-400 transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Pedidos */}
            {activeTab === 'pedidos' && (
              <div className="bg-surface border border-line p-6">
                <h2 className="text-xl font-bold text-content mb-6">Mis Pedidos</h2>

                {ordenes.length === 0 ? (
                  <div className="text-center py-12">
                    <Bag size={48} className="text-content-faint mx-auto mb-4" />
                    <p className="text-content-secondary mb-4">Aún no has realizado ningún pedido</p>
                    <Link
                      href="/productos"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors"
                    >
                      Explorar productos
                      <CaretRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordenes.map(orden => {
                      const estado = getEstadoOrden(orden.estado);
                      const itemsToShow = orden.items?.slice(0, 3) || [];
                      const remainingItems = (orden.items?.length || 0) - 3;
                      
                      return (
                        <div key={orden.id} className="p-4 bg-surface-raised border border-line hover:border-line-med transition-colors">
                          {/* Header del pedido */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-accent font-medium">#{orden.numeroOrden}</span>
                                <span className={`flex items-center gap-1.5 text-sm ${estado.color}`}>
                                  {estado.icon}
                                  {estado.label}
                                </span>
                              </div>
                              <p className="text-sm text-content-secondary">
                                {formatDate(orden.createdAt)} · {orden._count?.items || orden.items?.length || 0} productos
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-content font-bold tabular-nums">${parseFloat(String(orden.total)).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
                                <p className="text-xs text-content-muted">
                                  {orden.estadoPago === 'PAGADO' ? 'Pagado' : 'Pendiente de pago'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Productos del pedido */}
                          {itemsToShow.length > 0 && (
                            <div className="border-t border-line pt-4">
                              <div className="flex flex-wrap gap-3">
                                {itemsToShow.map((item) => {
                                  const imagen = item.producto?.imagenes?.find(img => img.esPrincipal)?.url 
                                    || item.producto?.imagenes?.[0]?.url;
                                  return (
                                    <div key={item.id} className="flex items-center gap-3 bg-surface border border-line p-2 pr-4">
                                      {imagen ? (
                                        <Image 
                                          src={imagen} 
                                          alt={item.nombreProducto || item.producto?.nombre || ''} 
                                          width={48}
                                          height={48}
                                          className="size-12 object-cover"
                                        />
                                      ) : (
                                        <div className="size-12 bg-surface-soft flex items-center justify-center">
                                          <Package size={20} className="text-content-faint" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-sm text-content truncate max-w-37.5">
                                          {item.nombreProducto || item.producto?.nombre}
                                        </p>
                                        <p className="text-xs text-content-muted">
                                          Cant: {item.cantidad} × <span className="tabular-nums">${parseFloat(String(item.precioUnitario)).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                                {remainingItems > 0 && (
                                  <div className="flex items-center justify-center px-4 py-2 bg-surface border border-line text-content-secondary text-sm">
                                    +{remainingItems} más
                                  </div>
                                )}
                              </div>
                              <Link 
                                href={`/cuenta/pedidos?orden=${orden.id}`}
                                className="inline-flex items-center gap-1 mt-3 text-sm text-accent hover:underline"
                              >
                                Ver detalles completos
                                <CaretRight size={16} />
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Favoritos */}
            {activeTab === 'favoritos' && (
              <div className="bg-surface border border-line p-6">
                <h2 className="text-xl font-bold text-content mb-6">Mis Favoritos</h2>

                {loadingFavoritos ? (
                  <div className="flex justify-center py-12">
                    <CircleNotch size={32} className="animate-spin text-accent" />
                  </div>
                ) : favoritos.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="text-content-faint mx-auto mb-4" />
                    <p className="text-content-secondary mb-4">Aún no tienes productos favoritos</p>
                    <Link
                      href="/productos"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors"
                    >
                      Explorar productos
                      <CaretRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoritos.map(fav => {
                      const producto = fav.producto;
                      if (!producto) return null;
                      
                      const imagenPrincipal = producto.imagenes?.find(img => img.esPrincipal)?.url 
                        || producto.imagenes?.[0]?.url 
                        || '/placeholder-product.png';
                      
                      return (
                        <div 
                          key={fav.id} 
                          className="group relative bg-surface-raised border border-line overflow-hidden hover:border-accent/30 transition-colors duration-300"
                        >
                          {/* Imagen del producto */}
                          <Link href={`/productos/${producto.slug}`} className="block aspect-square overflow-hidden relative">
                            <Image
                              src={imagenPrincipal}
                              alt={producto.nombre}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          
                          {/* Botón eliminar favorito */}
                          <button
                            onClick={() => toggleFavorito(producto.id)}
                            className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm border border-danger/30 text-danger hover:bg-danger hover:text-content transition-colors duration-200"
                            title="Eliminar de favoritos"
                          >
                            <Heart size={16} className="fill-current" />
                          </button>
                          
                          {/* Info del producto */}
                          <div className="p-4">
                            <Link 
                              href={`/productos/${producto.slug}`}
                              className="block text-content font-medium mb-1 hover:text-accent transition-colors line-clamp-2"
                            >
                              {producto.nombre}
                            </Link>
                            
                            {producto.marca && (
                              <p className="text-xs text-content-muted mb-2">{producto.marca.nombre}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-accent font-bold text-lg tabular-nums">
                                ${parseFloat(String(producto.precio)).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                              </span>
                              
                              {producto.stock > 0 ? (
                                <span className="text-xs text-green-500">En stock</span>
                              ) : (
                                <span className="text-xs text-red-500">Agotado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'seguridad' && (
              <div className="bg-surface border border-line p-6">
                <h2 className="text-xl font-bold text-content mb-6">Seguridad</h2>

                <div className="max-w-md">
                  <h3 className="text-lg font-semibold text-content mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-accent" />
                    Cambiar contraseña
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cuenta-currentPassword" className="block text-sm text-content-secondary mb-2">Contraseña actual</label>
                      <div className="relative">
                        <input
                          id="cuenta-currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          autoComplete="current-password"
                          className="w-full px-4 py-3 pr-12 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
                        >
                          {showPasswords.current ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cuenta-newPassword" className="block text-sm text-content-secondary mb-2">Nueva contraseña</label>
                      <div className="relative">
                        <input
                          id="cuenta-newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
                        >
                          {showPasswords.new ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                      <p className="text-xs text-content-muted mt-1">Mínimo 8 caracteres</p>
                    </div>

                    <div>
                      <label htmlFor="cuenta-confirmPassword" className="block text-sm text-content-secondary mb-2">Confirmar nueva contraseña</label>
                      <div className="relative">
                        <input
                          id="cuenta-confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 bg-surface-raised border border-line-med text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
                        >
                          {showPasswords.confirm ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={isPendingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                      className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 mt-6"
                    >
                      {isPendingPassword ? <CircleNotch size={16} className="animate-spin" /> : <Lock size={16} />}
                      Cambiar contraseña
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message={`¿Estás seguro que deseas cerrar tu sesión${profile?.nombre ? `, ${profile.nombre}` : ''}? Tendrás que volver a iniciar sesión para acceder a tu cuenta.`}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        isLoading={isPendingLogout}
      />
    </div>
  );
}

// Componente principal con Suspense para useSearchParams
export default function CuentaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <CircleNotch size={32} className="text-accent animate-spin" />
      </div>
    }>
      <CuentaContent />
    </Suspense>
  );
}
