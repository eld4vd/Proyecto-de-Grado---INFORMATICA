'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaperPlaneTilt, CircleNotch, CheckCircle, CaretDown, MagnifyingGlass
} from '@phosphor-icons/react';
import { useToast } from '../components/ui/Toast';
import { AnimatePresence, motion } from 'framer-motion';

/* ─── Support Search Bar (Monster Support style) ─── */
export function SupportSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/productos?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto">
      <div className="flex items-center bg-[#1a1a1a] border border-[#333] focus-within:border-accent/50 transition-colors">
        <MagnifyingGlass size={20} className="ml-4 text-content-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos, guías, soporte..."
          className="w-full h-12 px-3 bg-transparent text-content placeholder:text-content-faint focus:outline-none"
        />
      </div>
    </form>
  );
}

const subjects = [
  { value: '', label: 'Selecciona un tema' },
  { value: 'ventas', label: 'Consulta de ventas' },
  { value: 'soporte', label: 'Soporte técnico' },
  { value: 'pedido', label: 'Estado de pedido' },
  { value: 'devolucion', label: 'Devolución' },
  { value: 'otro', label: 'Otro' },
];

export function ContactForm() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.email.trim()) e.email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!form.asunto) e.asunto = 'Selecciona un asunto';
    if (!form.mensaje.trim()) e.mensaje = 'Requerido';
    else if (form.mensaje.trim().length < 10) e.mensaje = 'Mínimo 10 caracteres';
    return e;
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
    showToast({ type: 'success', title: '¡Mensaje enviado!', message: 'Te responderemos pronto.' });
    setTimeout(() => { setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); setStatus('idle'); }, 3000);
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 bg-accent/10 border border-accent/30 flex items-center justify-center mb-4">
          <CheckCircle size={32} weight="duotone" className="text-accent" />
        </div>
        <h3 className="text-xl font-bold text-content mb-2">¡Mensaje enviado!</h3>
        <p className="text-content-secondary max-w-sm">
          Nuestro equipo te responderá dentro de las próximas 24 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="c-nombre" className="block text-sm font-medium text-content-bright mb-2">
            Nombre <span className="text-accent">*</span>
          </label>
          <input id="c-nombre" type="text" name="nombre" autoComplete="name" placeholder="Tu nombre"
            value={form.nombre} onChange={onChange}
            className={`w-full h-11 px-4 bg-surface-card border ${errors.nombre ? 'border-danger' : 'border-line-med'} text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors`}
          />
          {errors.nombre && <p className="mt-1.5 text-xs text-danger">{errors.nombre}</p>}
        </div>
        <div>
          <label htmlFor="c-email" className="block text-sm font-medium text-content-bright mb-2">
            Email <span className="text-accent">*</span>
          </label>
          <input id="c-email" type="email" name="email" autoComplete="email" placeholder="tu@email.com"
            value={form.email} onChange={onChange}
            className={`w-full h-11 px-4 bg-surface-card border ${errors.email ? 'border-danger' : 'border-line-med'} text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="c-asunto" className="block text-sm font-medium text-content-bright mb-2">
          Asunto <span className="text-accent">*</span>
        </label>
        <select id="c-asunto" name="asunto" value={form.asunto} onChange={onChange}
          className={`w-full h-11 px-4 bg-surface-card border ${errors.asunto ? 'border-danger' : 'border-line-med'} text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors`}
        >
          {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        {errors.asunto && <p className="mt-1.5 text-xs text-danger">{errors.asunto}</p>}
      </div>

      <div>
        <label htmlFor="c-mensaje" className="block text-sm font-medium text-content-bright mb-2">
          Mensaje <span className="text-accent">*</span>
        </label>
        <textarea id="c-mensaje" name="mensaje" rows={5} placeholder="¿En qué podemos ayudarte?"
          value={form.mensaje} onChange={onChange}
          className={`w-full px-4 py-3 bg-surface-card border ${errors.mensaje ? 'border-danger' : 'border-line-med'} text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors resize-none`}
        />
        {errors.mensaje && <p className="mt-1.5 text-xs text-danger">{errors.mensaje}</p>}
      </div>

      <button type="submit" disabled={status === 'sending'}
        className="group inline-flex items-center gap-2.5 px-7 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] disabled:opacity-60 disabled:cursor-not-allowed transition-all relative overflow-hidden"
      >
        {status === 'sending' ? (
          <><CircleNotch size={18} weight="bold" className="animate-spin" /><span>Enviando...</span></>
        ) : (
          <>
            <span className="relative z-10">Enviar mensaje</span>
            <PaperPlaneTilt size={16} weight="bold" className="relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </>
        )}
      </button>
    </form>
  );
}

/* ─── FAQ Accordion ─── */
export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FAQItem key={faq.question} faq={faq} />
      ))}
    </div>
  );
}

function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-line-soft bg-surface overflow-hidden group">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-hover/50 transition-colors"
      >
        <span className="flex-1 font-medium text-content text-sm md:text-base">{faq.question}</span>
        <CaretDown size={18} className={`text-content-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 text-sm text-content-secondary leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
