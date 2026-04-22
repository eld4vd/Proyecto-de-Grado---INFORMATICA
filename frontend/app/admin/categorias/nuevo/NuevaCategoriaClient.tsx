'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ImageSquare, WarningCircle, TreeStructure } from '@phosphor-icons/react';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { AdminForm, FormField, Input, Textarea, Select, Checkbox } from '../../components/AdminForm';

interface CategoriaOption {
  id: string;
  nombre: string;
}

export interface NuevaCategoriaClientProps {
  initialCategoriasPadre: CategoriaOption[];
}

export default function NuevaCategoriaClient({ initialCategoriasPadre }: NuevaCategoriaClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoriasPadre, setCategoriasPadre] = useState<CategoriaOption[]>(initialCategoriasPadre);
  const [imageError, setImageError] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    imagenUrl: '',
    categoriaPadreId: '',
    activo: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'imagenUrl') {
      setImageError(false);
    }
  };

  // Generar slug automáticamente
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nombre = e.target.value;
    setFormData(prev => ({
      ...prev,
      nombre,
      slug: prev.slug || generateSlug(nombre),
    }));
    setErrors(prev => ({ ...prev, nombre: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
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
      setErrors({ general: 'Error al crear la categoría' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Nueva Categoría"
        description="Crear una nueva categoría de productos"
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
            loading={loading}
            submitLabel="Crear categoría"
            cancelHref="/admin/categorias"
          >
            <FormField label="Nombre" name="nombre" required error={errors.nombre}>
              <Input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleNombreChange}
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
                placeholder="Se genera automáticamente"
              />
              <p className="mt-1 text-xs text-gray-500">
                Se genera automáticamente a partir del nombre si lo dejas vacío
              </p>
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
              <p className="mt-1 text-xs text-gray-500">
                Dejar vacío para crear una categoría principal
              </p>
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

        {/* Panel de Previsualización */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f1419] border border-[#1e293b] p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ImageSquare size={16} className="text-admin-primary" aria-hidden="true" />
              Previsualización de Imagen
            </h3>
            
            <div className="aspect-video w-full bg-[#0b0f1a] border border-[#334155] flex items-center justify-center overflow-hidden">
              {formData.imagenUrl && !imageError ? (
                <Image
                  src={formData.imagenUrl}
                  alt="Imagen preview"
                  width={300}
                  height={200}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : formData.imagenUrl && imageError ? (
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
                <p className="text-xs text-gray-500 mb-2">Así se verá en la tienda:</p>
                <div className="flex items-center gap-3">
                  {formData.imagenUrl && !imageError ? (
                    <div className="size-12 bg-[#1e293b] flex items-center justify-center overflow-hidden">
                      <Image
                        src={formData.imagenUrl}
                        alt={formData.nombre}
                        width={48}
                        height={48}
                        className="object-cover"
                        onError={() => setImageError(true)}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="size-12 bg-admin-primary flex items-center justify-center">
                      <TreeStructure size={24} className="text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{formData.nombre}</p>
                    <p className="text-xs text-gray-500">/{formData.slug || 'slug'}</p>
                  </div>
                </div>
              </div>
            )}

            {formData.categoriaPadreId && (
              <div className="mt-3 p-3 bg-[#1e293b]/50 border border-[#334155]">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <TreeStructure size={12} aria-hidden="true" />
                  Subcategoría de: <span className="text-admin-primary">
                    {categoriasPadre.find(c => c.id === formData.categoriaPadreId)?.nombre}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
