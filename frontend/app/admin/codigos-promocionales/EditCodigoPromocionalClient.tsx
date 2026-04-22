'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleNotch, Tag } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminForm, FormField, Input, Select, Checkbox } from '../components/AdminForm';

interface CodigoPromocional {
  id: string;
  codigo: string;
  descuento: number;
  esPorcentaje: boolean;
  activo: boolean;
  fechaExpiracion: string | null;
  usosMaximos: number | null;
  usosActuales: number;
  createdAt: string;
}

export interface EditCodigoPromocionalClientProps {
  id: string;
  initialCodigo: CodigoPromocional;
}

function toDateTimeLocalValue(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditCodigoPromocionalClient({
  id,
  initialCodigo,
}: EditCodigoPromocionalClientProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    codigo: initialCodigo.codigo,
    descuento: String(initialCodigo.descuento),
    esPorcentaje: initialCodigo.esPorcentaje ? 'true' : 'false',
    activo: initialCodigo.activo,
    fechaExpiracion: toDateTimeLocalValue(initialCodigo.fechaExpiracion),
    usosMaximos: initialCodigo.usosMaximos ? String(initialCodigo.usosMaximos) : '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const codigo = formData.codigo.trim().toUpperCase();
    if (!/^(?=.*[0-9])[A-Z0-9_-]+$/.test(codigo)) {
      setErrors({
        codigo:
          'Debe estar en mayúsculas y contener al menos un número (ej. DESC10).',
      });
      return;
    }

    const descuento = Number(formData.descuento);
    if (Number.isNaN(descuento) || descuento <= 0) {
      setErrors({ descuento: 'El descuento debe ser mayor a 0.' });
      return;
    }

    if (formData.esPorcentaje === 'true' && descuento > 100) {
      setErrors({ descuento: 'El descuento porcentual no puede ser mayor a 100.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/codigos-promocionales/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          codigo,
          descuento,
          esPorcentaje: formData.esPorcentaje === 'true',
          activo: formData.activo,
          fechaExpiracion: formData.fechaExpiracion || undefined,
          usosMaximos: formData.usosMaximos ? Number(formData.usosMaximos) : undefined,
        }),
      });

      if (res.ok) {
        router.push('/admin/codigos-promocionales', { scroll: false });
      } else {
        const data = await res.json();
        const message = Array.isArray(data.message)
          ? data.message.join(' | ')
          : data.message || 'Error al actualizar el código';
        setErrors({ general: message });
      }
    } catch {
      setErrors({ general: 'Error al actualizar el código' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Editar Código Promocional"
        description="Actualiza descuento, vigencia y estado del código"
        backHref="/admin/codigos-promocionales"
        icon={Tag}
      />

      {errors.general && (
        <div className="mb-6 p-4 bg-admin-danger/10 border border-admin-danger/30 text-admin-danger text-sm">
          {errors.general}
        </div>
      )}

      {saving && (
        <div className="mb-6 p-3 border border-[#334155] bg-[#0f1419] text-gray-400 text-sm inline-flex items-center gap-2">
          <CircleNotch size={16} className="animate-spin" /> Guardando cambios...
        </div>
      )}

      <AdminForm
        onSubmit={handleSubmit}
        loading={saving}
        submitLabel="Guardar cambios"
        cancelHref="/admin/codigos-promocionales"
      >
        <FormField label="Código" name="codigo" required error={errors.codigo}>
          <Input
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            placeholder="Ej: DESC10"
            maxLength={50}
            required
            className="uppercase"
            error={Boolean(errors.codigo)}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Descuento" name="descuento" required error={errors.descuento}>
            <Input
              id="descuento"
              name="descuento"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.descuento}
              onChange={handleInputChange}
              required
              error={Boolean(errors.descuento)}
            />
          </FormField>

          <FormField label="Tipo de descuento" name="esPorcentaje" required>
            <Select
              id="esPorcentaje"
              name="esPorcentaje"
              value={formData.esPorcentaje}
              onChange={handleInputChange}
              options={[
                { value: 'true', label: 'Porcentaje (%)' },
                { value: 'false', label: 'Monto fijo (Bs.)' },
              ]}
            />
          </FormField>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FormField label="Fecha de expiración" name="fechaExpiracion">
            <Input
              id="fechaExpiracion"
              name="fechaExpiracion"
              type="datetime-local"
              value={formData.fechaExpiracion}
              onChange={handleInputChange}
            />
          </FormField>

          <FormField label="Usos máximos" name="usosMaximos">
            <Input
              id="usosMaximos"
              name="usosMaximos"
              type="number"
              min="1"
              step="1"
              value={formData.usosMaximos}
              onChange={handleInputChange}
              placeholder="Opcional"
            />
          </FormField>
        </div>

        <div className="border border-[#1e293b] p-4 bg-[#0b0f1a] space-y-3">
          <Checkbox
            label="Código activo"
            checked={formData.activo}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, activo: checked }))
            }
            name="activo"
          />
          <p className="text-xs text-gray-500">
            Usos actuales: {initialCodigo.usosActuales}
            {initialCodigo.usosMaximos ? ` / ${initialCodigo.usosMaximos}` : ''}
          </p>
        </div>
      </AdminForm>
    </div>
  );
}
