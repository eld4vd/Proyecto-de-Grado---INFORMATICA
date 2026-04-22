'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CodigoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const codigo = formData.get('codigo')?.toString().trim().toUpperCase() || '';

    if (!/^(?=.*[0-9])[A-Z0-9_-]+$/.test(codigo)) {
      setError('El código debe estar en mayúsculas y contener al menos un número.');
      setLoading(false);
      return;
    }

    const data = {
      codigo,
      descuento: Number(formData.get('descuento')),
      esPorcentaje: formData.get('esPorcentaje') === 'true',
      activo: formData.get('activo') === 'on',
      fechaExpiracion: formData.get('fechaExpiracion')?.toString() || undefined,
      usosMaximos: formData.get('usosMaximos') ? Number(formData.get('usosMaximos')) : undefined,
    };

    try {
      const res = await fetch('/api/codigos-promocionales/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || 'Error al crear código');
      }

      router.push('/admin/codigos-promocionales');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#0f1419] p-6 border border-[#334155]">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Código</label>
        <input
          name="codigo"
          type="text"
          required
          maxLength={50}
          pattern="^(?=.*[0-9])[A-Z0-9_-]+$"
          title="Debe estar en mayúsculas y contener al menos un número"
          placeholder="Ej: DESC10"
          className="w-full bg-[#1e293b] border border-[#334155] text-white px-4 py-2 focus:border-admin-primary focus:outline-none uppercase"
        />
        <p className="text-xs text-gray-500 mt-1">Debe estar en mayúsculas y contener al menos un número.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Descuento</label>
          <input
            name="descuento"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full bg-[#1e293b] border border-[#334155] text-white px-4 py-2 focus:border-admin-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de descuento</label>
          <select
            name="esPorcentaje"
            className="w-full bg-[#1e293b] border border-[#334155] text-white px-4 py-2 focus:border-admin-primary focus:outline-none"
          >
            <option value="true">Porcentaje (%)</option>
            <option value="false">Monto fijo (Bs.)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Expiración (opcional)</label>
        <input
          name="fechaExpiracion"
          type="datetime-local"
          className="w-full bg-[#1e293b] border border-[#334155] text-white px-4 py-2 focus:border-admin-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Usos Máximos (opcional)</label>
        <input
          name="usosMaximos"
          type="number"
          min="1"
          placeholder="Dejar en blanco para ilimitados"
          className="w-full bg-[#1e293b] border border-[#334155] text-white px-4 py-2 focus:border-admin-primary focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="activo"
          id="activo"
          defaultChecked
          className="size-4 bg-[#1e293b] border-[#334155] rounded text-admin-primary focus:ring-admin-primary focus:ring-offset-[#0f1419]"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-300">
          Código Activo
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-[#334155] text-gray-300 hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-admin-primary text-white hover:bg-admin-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Código'}
        </button>
      </div>
    </form>
  );
}