'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CircleNotch, ImageSquare, WarningCircle } from '@phosphor-icons/react';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { AdminForm, FormField, Input, Checkbox } from '../../components/AdminForm';

interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
}

export interface EditMarcaClientProps {
  id: string;
  initialMarca: Marca;
}

export default function EditMarcaClient({ id, initialMarca }: EditMarcaClientProps) {
  const router = useRouter();
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: initialMarca.nombre,
    slug: initialMarca.slug,
    logoUrl: initialMarca.logoUrl || '',
    activo: initialMarca.activo,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'logoUrl') {
      setImageError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/marcas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          slug: formData.slug || undefined,
          logoUrl: formData.logoUrl || null,
          activo: formData.activo,
        }),
      });

      if (res.ok) {
        router.push('/admin/marcas', { scroll: false });
      } else {
        const data = await res.json();
        if (data.message) {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error al actualizar la marca' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <CircleNotch size={32} className="text-admin-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Editar Marca"
        description="Modificar información de la marca"
        backHref="/admin/marcas"
      />

      {errors.general && (
        <div className="mb-6 p-4 bg-admin-danger/10 border border-admin-danger/30 text-admin-danger text-sm">
          {errors.general}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <AdminForm
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Guardar cambios"
            cancelHref="/admin/marcas"
          >
          <FormField label="Nombre" name="nombre" required error={errors.nombre}>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: ASUS, Dell, HP…"
              error={!!errors.nombre}
            />
          </FormField>

          <FormField label="Slug (URL)" name="slug">
            <Input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ej: asus, dell, hp"
            />
          </FormField>

          <FormField label="URL del Logo" name="logoUrl">
            <Input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
            />
          </FormField>

          <div className="pt-2">
            <Checkbox
              label="Marca activa (visible en la tienda)"
              checked={formData.activo}
              onChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
            />
          </div>
        </AdminForm>
        </div>

        {/* Panel de Previsualización */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1419] border border-[#1e293b] p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ImageSquare size={16} className="text-admin-primary" aria-hidden="true" />
              Previsualización del Logo
            </h3>
            
            <div className="aspect-square w-full bg-[#0b0f1a] border border-[#334155] flex items-center justify-center overflow-hidden">
              {formData.logoUrl && !imageError ? (
                <Image
                  src={formData.logoUrl}
                  alt="Logo preview"
                  width={200}
                  height={200}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : formData.logoUrl && imageError ? (
                <div className="text-center p-4">
                  <WarningCircle size={40} className="text-admin-danger mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs text-admin-danger">No se pudo cargar la imagen</p>
                  <p className="text-xs text-gray-500 mt-1">Verifica la URL</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <ImageSquare size={48} className="text-gray-700 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs text-gray-500">Ingresa una URL de imagen</p>
                  <p className="text-xs text-gray-600">para ver la previsualización</p>
                </div>
              )}
            </div>

            {formData.nombre && (
              <div className="mt-4 p-4 bg-[#0b0f1a] border border-[#334155]">
                <p className="text-xs text-gray-500 mb-1">Así se verá en la tienda:</p>
                <div className="flex items-center gap-3">
                  {formData.logoUrl && !imageError ? (
                    <div className="size-10 bg-[#1e293b] flex items-center justify-center overflow-hidden">
                      <Image
                        src={formData.logoUrl}
                        alt={formData.nombre}
                        width={40}
                        height={40}
                        className="object-contain"
                        onError={() => setImageError(true)}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="size-10 bg-admin-primary flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {formData.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{formData.nombre}</p>
                    <p className="text-xs text-gray-500">/{formData.slug || 'slug'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
