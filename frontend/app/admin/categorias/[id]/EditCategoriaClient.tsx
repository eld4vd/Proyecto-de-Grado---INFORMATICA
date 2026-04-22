'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CircleNotch, ImageSquare, WarningCircle, TreeStructure } from '@phosphor-icons/react';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { AdminForm, FormField, Input, Textarea, Select, Checkbox } from '../../components/AdminForm';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  categoriaPadreId: string | null;
  activo: boolean;
}

export interface EditCategoriaClientProps {
  id: string;
  initialCategoria: Categoria;
  initialCategoriasPadre: { id: string; nombre: string }[];
}

export default function EditCategoriaClient({ id, initialCategoria, initialCategoriasPadre }: EditCategoriaClientProps) {
  const router = useRouter();
  const [loading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoriasPadre, setCategoriasPadre] = useState<{ id: string; nombre: string }[]>(initialCategoriasPadre);
  const [imageError, setImageError] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: initialCategoria.nombre,
    slug: initialCategoria.slug,
    descripcion: initialCategoria.descripcion || '',
    imagenUrl: initialCategoria.imagenUrl || '',
    categoriaPadreId: initialCategoria.categoriaPadreId || '',
    activo: initialCategoria.activo,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'imagenUrl') setImageError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          slug: formData.slug || undefined,
          descripcion: formData.descripcion || null,
          imagenUrl: formData.imagenUrl || null,
          categoriaPadreId: formData.categoriaPadreId || null,
          activo: formData.activo,
        }),
      });

      if (res.ok) {
        router.push('/admin/categorias', { scroll: false });
      } else {
        const data = await res.json();
        if (data.message) {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      setErrors({ general: 'Error al actualizar la categoría' });
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
        title="Editar Categoría"
        description="Modificar información de la categoría"
        backHref="/admin/categorias"
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
            cancelHref="/admin/categorias"
          >
            <FormField label="Nombre" name="nombre" required error={errors.nombre}>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Laptops, Accesorios, Gaming…"
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
                placeholder="ej: laptops, accesorios"
              />
            </FormField>

            <FormField label="Categoría padre" name="categoriaPadreId">
              <Select
                id="categoriaPadreId"
                name="categoriaPadreId"
                value={formData.categoriaPadreId}
                onChange={handleChange}
                placeholder="Ninguna (categoría principal)"
                options={categoriasPadre.map(c => ({ value: c.id, label: c.nombre }))}
              />
            </FormField>

            <FormField label="Descripción" name="descripcion">
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción de la categoría…"
                rows={3}
              />
            </FormField>

            <FormField label="URL de imagen" name="imagenUrl">
              <Input
                type="url"
                id="imagenUrl"
                name="imagenUrl"
                value={formData.imagenUrl}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.png"
              />
            </FormField>

            <div className="pt-2">
              <Checkbox
                label="Categoría activa (visible en la tienda)"
                checked={formData.activo}
                onChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
              />
            </div>
          </AdminForm>
        </div>

        {/* Panel de previsualización */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1419] border border-[#334155] rounded-lg p-6 sticky top-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <ImageSquare size={20} className="text-admin-primary" aria-hidden="true" />
              Previsualización
            </h3>

            <div className="space-y-4">
              {/* Preview de imagen */}
              <div className="aspect-video bg-[#0b0f1a] border border-[#334155] rounded-lg overflow-hidden flex items-center justify-center">
                {formData.imagenUrl && !imageError ? (
                  <Image
                    src={formData.imagenUrl}
                    alt="Vista previa"
                    width={400}
                    height={225}
                    className="w-full h-full object-contain"
                    unoptimized
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    {imageError ? (
                      <div className="flex flex-col items-center gap-2">
                        <WarningCircle size={32} className="text-admin-danger" aria-hidden="true" />
                        <span className="text-sm text-admin-danger">Error al cargar</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageSquare size={32} className="text-gray-600" aria-hidden="true" />
                        <span className="text-sm">Sin imagen</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info de la imagen */}
              {formData.imagenUrl && !imageError && (
                <div className="text-xs text-gray-500 break-all">
                  {formData.imagenUrl}
                </div>
              )}

              {/* Mini preview de cómo se vería */}
              <div className="pt-4 border-t border-[#334155]">
                <p className="text-xs text-gray-500 mb-3">Vista en tienda:</p>
                <div className="bg-[#0b0f1a] border border-[#334155] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-[#0f1419] rounded-lg overflow-hidden flex items-center justify-center border border-[#334155]">
                      {formData.imagenUrl && !imageError ? (
                        <Image
                          src={formData.imagenUrl}
                          alt={formData.nombre || 'Categoría'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <TreeStructure size={20} className="text-gray-600" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.nombre || 'Nombre de categoría'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formData.slug || 'slug-categoria'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
