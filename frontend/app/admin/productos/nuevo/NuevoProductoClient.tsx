'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Trash, ImageSquare, DotsSixVertical } from '@phosphor-icons/react';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { AdminForm, FormField, Input, Textarea, Select } from '../../components/AdminForm';
import { Checkbox } from '../../components/AdminForm';

interface Marca {
  id: string;
  nombre: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Especificacion {
  nombre: string;
  valor: string;
}

interface ImagenForm {
  url: string;
  esPrincipal: boolean;
}

export interface NuevoProductoClientProps {
  initialMarcas: Marca[];
  initialCategorias: Categoria[];
}

export default function NuevoProductoClient({ initialMarcas, initialCategorias }: NuevoProductoClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [marcas, setMarcas] = useState<Marca[]>(initialMarcas);
  const [categorias, setCategorias] = useState<Categoria[]>(initialCategorias);

  // Datos del producto
  const [form, setForm] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    marcaId: '',
    precio: '',
    precioOferta: '',
    stock: '0',
    activo: true,
    destacado: false,
  });

  // Imágenes
  const [imagenes, setImagenes] = useState<ImagenForm[]>([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');

  // Categorías seleccionadas
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);

  // Especificaciones
  const [especificaciones, setEspecificaciones] = useState<Especificacion[]>([]);
  const [nuevaEspec, setNuevaEspec] = useState({ nombre: '', valor: '' });

  // Generar slug
  const generateSlug = (nombre: string): string => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Agregar imagen
  const addImagen = () => {
    if (!nuevaImagenUrl.trim()) return;
    setImagenes(prev => [
      ...prev,
      { url: nuevaImagenUrl.trim(), esPrincipal: prev.length === 0 }
    ]);
    setNuevaImagenUrl('');
  };

  // Eliminar imagen
  const removeImagen = (index: number) => {
    setImagenes(prev => {
      const newList = prev.filter((_, i) => i !== index);
      // Si se eliminó la principal, hacer la primera como principal
      if (prev[index].esPrincipal && newList.length > 0) {
        newList[0].esPrincipal = true;
      }
      return newList;
    });
  };

  // Establecer imagen principal
  const setImagenPrincipal = (index: number) => {
    setImagenes(prev => prev.map((img, i) => ({
      ...img,
      esPrincipal: i === index,
    })));
  };

  // Toggle categoría
  const toggleCategoria = (catId: string) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  // Agregar especificación
  const addEspecificacion = () => {
    if (!nuevaEspec.nombre.trim() || !nuevaEspec.valor.trim()) return;
    setEspecificaciones(prev => [...prev, { ...nuevaEspec }]);
    setNuevaEspec({ nombre: '', valor: '' });
  };

  // Eliminar especificación
  const removeEspecificacion = (index: number) => {
    setEspecificaciones(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        sku: form.sku,
        nombre: form.nombre,
        slug: generateSlug(form.nombre),
        descripcion: form.descripcion,
        marcaId: form.marcaId || null,
        precio: parseFloat(form.precio),
        precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : null,
        stock: parseInt(form.stock),
        activo: form.activo,
        destacado: form.destacado,
        imagenes: imagenes.map((img, i) => ({
          url: img.url,
          esPrincipal: img.esPrincipal,
          orden: i,
        })),
        categoriaIds: categoriasSeleccionadas,
        especificaciones,
      };

      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/productos', { scroll: false });
      } else {
        const error = await res.json();
        alert(error.message || 'Error al crear el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Nuevo Producto"
        description="Agrega un nuevo producto al catálogo"
        backHref="/admin/productos"
      />

      <AdminForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Crear producto"
        cancelHref="/admin/productos"
      >
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="SKU" name="sku" required>
            <Input
              id="sku"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="PROD-001"
              required
            />
          </FormField>

          <FormField label="Marca" name="marcaId">
            <Select
              id="marcaId"
              name="marcaId"
              value={form.marcaId}
              onChange={handleChange}
              placeholder="Seleccionar marca"
              options={marcas.map(m => ({ value: m.id, label: m.nombre }))}
            />
          </FormField>
        </div>

        <FormField label="Nombre del producto" name="nombre" required>
          <Input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre del producto"
            required
          />
        </FormField>

        <FormField label="Descripción" name="descripcion" required>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción detallada del producto…"
            rows={4}
            required
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Precio (BOB)" name="precio" required>
            <Input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              value={form.precio}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </FormField>

          <FormField label="Precio oferta (BOB)" name="precioOferta">
            <Input
              id="precioOferta"
              name="precioOferta"
              type="number"
              step="0.01"
              min="0"
              value={form.precioOferta}
              onChange={handleChange}
              placeholder="Dejar vacío si no hay oferta"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Stock" name="stock" required>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
              required
            />
          </FormField>
        </div>

        {/* Opciones */}
        <div className="flex flex-wrap gap-6 py-2">
          <Checkbox
            name="activo"
            checked={form.activo}
            onChange={(checked) => setForm(prev => ({ ...prev, activo: checked }))}
            label="Producto activo"
          />
          <Checkbox
            name="destacado"
            checked={form.destacado}
            onChange={(checked) => setForm(prev => ({ ...prev, destacado: checked }))}
            label="Producto destacado"
          />
        </div>

        {/* Separador */}
        <div className="border-t border-[#334155] pt-4 mt-4">
          <h3 className="text-lg font-medium text-white mb-4">Imágenes</h3>
          
          {/* Lista de imágenes */}
          {imagenes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {imagenes.map((img, idx) => (
                <div key={idx} className="relative group bg-[#1e293b] border border-[#334155]">
                  <Image 
                    src={img.url} 
                    alt={`Imagen ${idx + 1}`}
                    width={200}
                    height={96}
                    className="w-full h-24 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImagenPrincipal(idx)}
                      className={`p-1.5 ${img.esPrincipal ? 'bg-admin-primary text-white' : 'bg-[#334155] text-white hover:bg-admin-primary hover:text-white'} transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary`}
                      title={img.esPrincipal ? 'Imagen principal' : 'Establecer como principal'}
                      aria-label={img.esPrincipal ? 'Imagen principal' : 'Establecer como imagen principal'}
                    >
                      <ImageSquare size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImagen(idx)}
                      className="p-1.5 bg-admin-danger text-white hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger"
                      aria-label="Eliminar imagen"
                    >
                      <Trash size={16} aria-hidden="true" />
                    </button>
                  </div>
                  {img.esPrincipal && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-admin-primary text-white text-xs font-medium">
                      Principal
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Agregar imagen */}
          <div className="flex gap-2">
            <Input
              value={nuevaImagenUrl}
              onChange={(e) => setNuevaImagenUrl(e.target.value)}
              placeholder="URL de la imagen…"
              className="flex-1"
            />
            <button
              type="button"
              onClick={addImagen}
              className="px-4 py-2 bg-[#1e293b] border border-[#334155] text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              aria-label="Agregar imagen"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Categorías */}
        <div className="border-t border-[#334155] pt-4 mt-4">
          <h3 className="text-lg font-medium text-white mb-4">Categorías</h3>
          
          <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccionar categorías">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategoria(cat.id)}
                aria-pressed={categoriasSeleccionadas.includes(cat.id)}
                className={`px-3 py-1.5 text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] ${
                  categoriasSeleccionadas.includes(cat.id)
                    ? 'bg-admin-primary text-white border-admin-primary'
                    : 'bg-transparent text-gray-400 border-[#334155] hover:border-admin-primary hover:text-white'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
          
          {categorias.length === 0 && (
            <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
          )}
        </div>

        {/* Especificaciones */}
        <div className="border-t border-[#334155] pt-4 mt-4">
          <h3 className="text-lg font-medium text-white mb-4">Especificaciones</h3>
          
          {/* Lista de especificaciones */}
          {especificaciones.length > 0 && (
            <div className="space-y-2 mb-4">
              {especificaciones.map((espec, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#1e293b] p-2">
                  <DotsSixVertical size={16} className="text-gray-600" aria-hidden="true" />
                  <span className="text-white font-medium min-w-30">{espec.nombre}:</span>
                  <span className="text-gray-400 flex-1">{espec.valor}</span>
                  <button
                    type="button"
                    onClick={() => removeEspecificacion(idx)}
                    className="p-1 text-gray-500 hover:text-admin-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger"
                    aria-label={`Eliminar especificación ${espec.nombre}`}
                  >
                    <Trash size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar especificación */}
          <div className="flex gap-2">
            <Input
              value={nuevaEspec.nombre}
              onChange={(e) => setNuevaEspec(prev => ({ ...prev, nombre: e.target.value }))}
              placeholder="Nombre (ej: Procesador)"
              className="flex-1"
            />
            <Input
              value={nuevaEspec.valor}
              onChange={(e) => setNuevaEspec(prev => ({ ...prev, valor: e.target.value }))}
              placeholder="Valor (ej: Intel Core i7)"
              className="flex-1"
            />
            <button
              type="button"
              onClick={addEspecificacion}
              className="px-4 py-2 bg-[#1e293b] border border-[#334155] text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              aria-label="Agregar especificación"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </AdminForm>
    </div>
  );
}
