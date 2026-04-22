interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  label?: string;
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-400',
  inactive: 'bg-gray-500/10 text-gray-500',
  pending: 'bg-admin-warning/10 text-admin-warning',
  success: 'bg-emerald-500/10 text-emerald-400',
  error: 'bg-admin-danger/10 text-admin-danger',
  warning: 'bg-admin-warning/10 text-admin-warning',
};

const defaultLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  success: 'Completado',
  error: 'Error',
  warning: 'Advertencia',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {label || defaultLabels[status]}
    </span>
  );
}
