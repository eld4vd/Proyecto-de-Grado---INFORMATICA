'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShoppingCart, CreditCard, Warning, UserPlus, X, Check, Checks, Clock } from '@phosphor-icons/react';

// ============================================================================
// TYPES
// ============================================================================

interface Notification {
  id: string;
  type: 'new_order' | 'payment_received' | 'low_stock' | 'new_client';
  title: string;
  message: string;
  timestamp: string;
  href?: string;
  meta?: Record<string, unknown>;
}

interface NotificationSummary {
  total: number;
  newOrders: number;
  newPayments: number;
  lowStock: number;
  newClients: number;
}

interface NotificationResponse {
  notifications: Notification[];
  summary: NotificationSummary;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POLL_INTERVAL = 30_000; // 30 segundos
const STORAGE_KEY = 'admin_notifications_last_seen';
const STORAGE_READ_KEY = 'admin_notifications_read_ids';

// ============================================================================
// HELPERS
// ============================================================================

function getLastSeen(): string {
  if (typeof window === 'undefined') return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  return localStorage.getItem(STORAGE_KEY) || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

function setLastSeen(iso: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, iso);
  }
}

function getReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_READ_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>) {
  if (typeof window !== 'undefined') {
    // Keep only last 200 IDs to avoid storage bloat
    const arr = [...ids].slice(-200);
    localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(arr));
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

const NOTIFICATION_CONFIG: Record<
  Notification['type'],
  { icon: typeof ShoppingCart; color: string; bgColor: string }
> = {
  new_order: {
    icon: ShoppingCart,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  payment_received: {
    icon: CreditCard,
    color: 'text-admin-primary',
    bgColor: 'bg-admin-primary/10',
  },
  low_stock: {
    icon: Warning,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  new_client: {
    icon: UserPlus,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
};

// ============================================================================
// NOTIFICATION BELL (exported for AdminShell header)
// ============================================================================

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const since = getLastSeen();
      const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(since)}`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data: NotificationResponse = await res.json();
      setNotifications(data.notifications);
      setSummary(data.summary);
    } catch {
      // Silently fail — polling will retry
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    setReadIds(getReadIds());
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistReadIds(next);
      return next;
    });
    setLastSeen(new Date().toISOString());
  }, [notifications]);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    notifications,
    summary,
    unreadCount,
    readIds,
    isOpen,
    toggle,
    close,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}

// ============================================================================
// NOTIFICATION PANEL COMPONENT
// ============================================================================

interface NotificationPanelProps {
  notifications: Notification[];
  readIds: Set<string>;
  unreadCount: number;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationPanel({
  notifications,
  readIds,
  unreadCount,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if the click was on the bell button (parent handles that)
        const target = e.target as HTMLElement;
        if (target.closest('[data-notification-bell]')) return;
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleItemClick = (notification: Notification) => {
    onMarkAsRead(notification.id);
    if (notification.href) {
      router.push(notification.href);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Panel de notificaciones"
      className="absolute top-full right-0 mt-2 w-95 max-h-130 bg-[#0f1419] border border-[#334155] shadow-2xl shadow-black/50 z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-admin-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-admin-primary text-white leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 text-gray-500 hover:text-admin-primary transition-colors"
              title="Marcar todo como leído"
              aria-label="Marcar todas las notificaciones como leídas"
            >
              <Checks size={16} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-white transition-colors"
            aria-label="Cerrar notificaciones"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Bell size={40} className="text-gray-700 mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-500 text-center">No hay notificaciones nuevas</p>
            <p className="text-xs text-gray-600 mt-1">Las últimas 24 horas están tranquilas</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#1e293b]" role="list">
            {notifications.map((notification) => {
              const config = NOTIFICATION_CONFIG[notification.type];
              const Icon = config.icon;
              const isRead = readIds.has(notification.id);

              return (
                <li key={notification.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleItemClick(notification)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(notification); } }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-surface-card cursor-pointer group ${
                      isRead ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`shrink-0 size-8 flex items-center justify-center ${config.bgColor} mt-0.5`}
                    >
                      <Icon className={`size-4 ${config.color}`} aria-hidden="true" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isRead ? 'text-gray-400' : 'text-white'}`}>
                          {notification.title}
                        </span>
                        {!isRead && (
                          <span className="size-1.5 bg-admin-primary shrink-0" aria-label="No leída" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-gray-600" aria-hidden="true" />
                        <span className="text-[10px] text-gray-600">{timeAgo(notification.timestamp)}</span>
                      </div>
                    </div>

                    {/* Read indicator */}
                    {!isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="shrink-0 p-1 text-gray-600 hover:text-admin-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Marcar como leída"
                        aria-label="Marcar como leída"
                      >
                        <Check size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-[#1e293b] bg-[#0b0f1a]">
          <p className="text-[10px] text-gray-600 text-center">
            Mostrando {notifications.length} notificaciones de las últimas 24h
          </p>
        </div>
      )}
    </div>
  );
}
