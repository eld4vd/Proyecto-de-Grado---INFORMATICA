'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Envelope, Calendar, ShieldCheck, Eye, EyeSlash, CircleNotch, CheckCircle, WarningCircle, FloppyDisk } from '@phosphor-icons/react';
// bundle-barrel-imports: Importar directamente en vez de barrel file
import { AdminPageHeader } from '../components/AdminPageHeader';
import { FormField, Input } from '../components/AdminForm';
import { getProfile } from '@/app/lib/auth';

interface AdminProfile {
  id: number;
  email: string;
  nombre: string;
  activo: boolean;
  lastLoginAt: string;
  createdAt: string;
  role: string;
}

interface Message {
  type: 'success' | 'error';
  text: string;
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Estados del formulario de perfil
  const [nombre, setNombre] = useState('');
  const [isSavingProfile, startSaveProfileTransition] = useTransition();
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);
  
  // Estados del formulario de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, startSavePasswordTransition] = useTransition();
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    startTransition(async () => {
      try {
        const data = await getProfile();
        if (!data || data.role !== 'admin') {
          router.push('/login?type=admin');
          return;
        }
        setProfile(data as unknown as AdminProfile);
        setNombre(data.nombre || '');
      } catch {
        router.push('/login?type=admin');
      }
    });
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Al menos un carácter especial (@$!%*?&)');
    }
    return errors;
  }

  useEffect(() => {
    if (newPassword) {
      setPasswordErrors(validatePassword(newPassword));
    } else {
      setPasswordErrors([]);
    }
  }, [newPassword]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    startSaveProfileTransition(async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ nombre }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al actualizar perfil');
        }

        setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        if (data.user) {
          setProfile(prev => prev ? { ...prev, ...data.user } : prev);
        }
      } catch (error) {
        setProfileMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Error al actualizar perfil' 
        });
      }
    });
  }, [nombre]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validaciones
    if (passwordErrors.length > 0) {
      setPasswordMessage({ type: 'error', text: 'La contraseña no cumple los requisitos' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({ type: 'error', text: 'La nueva contraseña debe ser diferente a la actual' });
      return;
    }

    startSavePasswordTransition(async () => {
      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cambiar contraseña');
        }

        setPasswordMessage({ type: 'success', text: 'Contraseña cambiada correctamente' });
        // Limpiar campos
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        setPasswordMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Error al cambiar contraseña' 
        });
      }
    });
  }, [passwordErrors.length, newPassword, confirmPassword, currentPassword]);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (isPending && !profile) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <CircleNotch size={32} className="text-admin-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <AdminPageHeader 
        title="Configuración de Cuenta" 
        description="Administra tu información personal y seguridad"
      />

      {/* Info del usuario */}
      <div className="bg-[#0f1419] border border-[#1e293b] p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="size-16 bg-admin-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">
              {profile?.nombre?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{profile?.nombre}</h2>
            <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
              <Envelope size={16} aria-hidden="true" />
              {profile?.email}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-admin-primary" aria-hidden="true" />
                Administrador
              </span>
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar size={16} aria-hidden="true" />
                Último acceso: {profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'profile'
              ? 'border-admin-primary text-admin-primary'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <User size={16} aria-hidden="true" />
          Información Personal
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'password'
              ? 'border-admin-primary text-admin-primary'
              : 'border-transparent text-gray-500 hover:text-white'
          }`}
        >
          <Lock size={16} aria-hidden="true" />
          Cambiar Contraseña
        </button>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'profile' ? (
        <div className="bg-[#0f1419] border border-[#1e293b] p-6 md:p-8">
          <form onSubmit={handleSaveProfile}>
            {profileMessage && (
              <div className={`mb-4 p-4 flex items-center gap-3 ${
                profileMessage.type === 'success' 
                  ? 'bg-admin-primary/10 border border-admin-primary/20 text-admin-primary' 
                  : 'bg-admin-danger/10 border border-admin-danger/20 text-admin-danger'
              }`}>
                {profileMessage.type === 'success' ? (
                  <CheckCircle size={20} className="shrink-0" />
                ) : (
                  <WarningCircle size={20} className="shrink-0" />
                )}
                {profileMessage.text}
              </div>
            )}

            <div className="grid gap-4 max-w-md">
              <FormField label="Email" name="email">
                <div className="relative">
                  <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">El email no puede ser modificado</p>
              </FormField>

              <FormField label="Nombre" name="nombre" required>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <Input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre…"
                    className="pl-10"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
              </FormField>
            </div>

            <div className="mt-6 pt-6 border-t border-[#1e293b]">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-admin-primary text-white font-medium text-sm hover:bg-admin-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingProfile ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <FloppyDisk size={16} aria-hidden="true" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-[#0f1419] border border-[#1e293b] p-6 md:p-8">
          <form onSubmit={handleChangePassword}>
            {passwordMessage && (
              <div className={`mb-4 p-4 flex items-center gap-3 ${
                passwordMessage.type === 'success' 
                  ? 'bg-admin-primary/10 border border-admin-primary/20 text-admin-primary' 
                  : 'bg-admin-danger/10 border border-admin-danger/20 text-admin-danger'
              }`}>
                {passwordMessage.type === 'success' ? (
                  <CheckCircle size={20} className="shrink-0" />
                ) : (
                  <WarningCircle size={20} className="shrink-0" />
                )}
                {passwordMessage.text}
              </div>
            )}

            <div className="grid gap-4 max-w-md">
              {/* Contraseña actual */}
              <FormField label="Contraseña Actual" name="currentPassword" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 bg-[#0b0f1a] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary/50 focus-visible:border-admin-primary transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    aria-label={showCurrentPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showCurrentPassword ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </FormField>

              {/* Nueva contraseña */}
              <FormField label="Nueva Contraseña" name="newPassword" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 bg-[#0b0f1a] border text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors ${
                      newPassword && passwordErrors.length > 0 
                        ? 'border-admin-danger focus-visible:border-admin-danger' 
                        : newPassword && passwordErrors.length === 0
                        ? 'border-admin-primary focus-visible:border-admin-primary'
                        : 'border-[#334155] focus-visible:border-admin-primary'
                    }`}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNewPassword ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                
                {/* Indicadores de requisitos */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    {[
                      { label: 'Mínimo 8 caracteres', valid: newPassword.length >= 8 },
                      { label: 'Una letra mayúscula', valid: /[A-Z]/.test(newPassword) },
                      { label: 'Una letra minúscula', valid: /[a-z]/.test(newPassword) },
                      { label: 'Un número', valid: /\d/.test(newPassword) },
                      { label: 'Un carácter especial (@$!%*?&)', valid: /[@$!%*?&]/.test(newPassword) },
                    ].map((req, i) => (
                      <div 
                        key={i}
                        className={`flex items-center gap-2 text-xs ${req.valid ? 'text-admin-primary' : 'text-gray-500'}`}
                      >
                        {req.valid ? <CheckCircle size={12} /> : <div className="size-3 border border-gray-600" />}
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
              </FormField>

              {/* Confirmar contraseña */}
              <FormField label="Confirmar Nueva Contraseña" name="confirmPassword" required>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 bg-[#0b0f1a] border text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-admin-danger focus-visible:border-admin-danger'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-admin-primary focus-visible:border-admin-primary'
                        : 'border-[#334155] focus-visible:border-admin-primary'
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-admin-danger mt-1 flex items-center gap-1">
                    <WarningCircle size={12} />
                    Las contraseñas no coinciden
                  </p>
                )}
                {confirmPassword && confirmPassword === newPassword && newPassword && (
                  <p className="text-xs text-admin-primary mt-1 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Las contraseñas coinciden
                  </p>
                )}
              </FormField>
            </div>

            {/* Nota de seguridad */}
            <div className="mt-4 p-4 bg-[#1e293b] border border-[#334155]">
              <p className="text-xs text-gray-400">
                <strong className="text-gray-300">Nota de seguridad:</strong> Por tu seguridad, después de cambiar la contraseña 
                se cerrará la sesión en todos los dispositivos excepto este. Asegúrate de recordar la nueva contraseña.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[#1e293b]">
              <button
                type="submit"
                disabled={isSavingPassword || passwordErrors.length > 0 || newPassword !== confirmPassword || !currentPassword || !newPassword}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-admin-primary text-white font-medium text-sm hover:bg-admin-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingPassword ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                    Cambiando…
                  </>
                ) : (
                  <>
                    <Lock size={16} aria-hidden="true" />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-6 text-sm text-gray-500">
        <p>Cuenta creada el {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}</p>
      </div>
    </div>
  );
}
