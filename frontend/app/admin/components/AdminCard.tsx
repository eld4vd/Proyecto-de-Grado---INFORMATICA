import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  accent?: boolean;
}

export function AdminCard({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  accent = false,
}: AdminCardProps) {
  return (
    <div className={`
      bg-[#0f1419] border border-[#1e293b] relative overflow-hidden
      ${hover ? 'hover:border-admin-primary/30 transition-colors duration-300 group' : ''}
      ${padding ? 'p-6' : ''} 
      ${className}
    `}>
      {/* Top accent line */}
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-admin-primary/50 to-transparent" />
      )}
      {/* Hover glow effect */}
      {hover && (
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-admin-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {children}
    </div>
  );
}
