'use client';

import { ReactNode, FormEvent } from 'react';
import { CircleNotch, FloppyDisk, X } from '@phosphor-icons/react';
import Link from 'next/link';

interface AdminFormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  cancelHref?: string;
  onCancel?: () => void;
}

export function AdminForm({
  children,
  onSubmit,
  loading = false,
  submitLabel = 'Guardar',
  cancelHref,
  onCancel,
}: AdminFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-[#0f1419] border border-[#1e293b] p-6">
        <div className="space-y-5">
          {children}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        {(cancelHref || onCancel) && (
          cancelHref ? (
            <Link
              href={cancelHref}
              scroll={false}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#334155] text-gray-400 font-medium text-sm hover:text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
            >
              <X size={16} aria-hidden="true" />
              Cancelar
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#334155] text-gray-400 font-medium text-sm hover:text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
            >
              <X size={16} aria-hidden="true" />
              Cancelar
            </button>
          )
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-admin-primary text-white font-medium text-sm hover:bg-admin-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          {loading ? (
            <>
              <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : (
            <>
              <FloppyDisk size={16} aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Componentes de campos de formulario
interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-admin-danger ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-admin-danger">{error}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', type, ...props }: InputProps) {
  // Deshabilitar spellcheck para emails, códigos y usernames
  const shouldDisableSpellCheck = type === 'email' || type === 'password' || props.name?.includes('email') || props.name?.includes('code') || props.name?.includes('sku');
  
  return (
    <input
      {...props}
      type={type}
      spellCheck={shouldDisableSpellCheck ? false : props.spellCheck}
      autoComplete={props.autoComplete || 'off'}
      className={`w-full px-4 py-3 bg-[#0b0f1a] border ${error ? 'border-admin-danger' : 'border-[#334155]'} text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors ${className}`}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      autoComplete={props.autoComplete || 'off'}
      className={`w-full px-4 py-3 bg-[#0b0f1a] border ${error ? 'border-admin-danger' : 'border-[#334155]'} text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors resize-none ${className}`}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ error, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-3 bg-[#0b0f1a] border ${error ? 'border-admin-danger' : 'border-[#334155]'} text-white focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors ${className}`}
    >
      {placeholder && (
        <option value="" className="bg-[#0f1419]">{placeholder}</option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0f1419]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}

export function Checkbox({ label, checked, onChange, name }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="size-5 border border-[#334155] bg-[#0b0f1a] peer-checked:bg-admin-primary peer-checked:border-admin-primary peer-focus-visible:ring-2 peer-focus-visible:ring-admin-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0f1419] transition-colors flex items-center justify-center">
          {checked && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
