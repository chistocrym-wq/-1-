import { useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  parts: string[];
  translations?: string[];
  className?: string;
  title?: string;
}

function keyFor(parts: string[]) {
  let h = 2166136261;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return `otto-eye-${(h >>> 0).toString(16)}`;
}

export function CompactTranslationEye({ parts, translations: preset, className, title = 'Перевод' }: Props) {
  const clean = useMemo(() => parts.map(String).map((v) => v.trim()).filter(Boolean), [parts]);
  const key = useMemo(() => keyFor(clean), [clean]);
  const validPreset = preset && preset.length === clean.length ? preset : null;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [translations, setTranslations] = useState<string[] | null>(() => {
    if (validPreset) return validPreset;
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (translations || loading || !clean.length) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/translate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: clean }),
      });
      const p = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(p.error || 'Перевод недоступен');
      const t = Array.isArray(p.translations) ? p.translations.map(String) : [];
      if (t.length !== clean.length) throw new Error('Перевод пришёл не полностью');
      setTranslations(t);
      try { localStorage.setItem(key, JSON.stringify(t)); } catch { /* ignore */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Перевод недоступен');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Скрыть перевод' : 'Показать перевод'}
        title={open ? 'Скрыть перевод' : 'Показать перевод'}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl border transition',
          open ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-[76px] z-[100] mx-auto max-h-[55vh] max-w-lg overflow-y-auto rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-slate-800 shadow-2xl sm:left-auto sm:right-6 sm:w-[420px]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-wider text-amber-800">{title}</p>
            <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600" aria-label="Закрыть перевод">
              <X className="h-4 w-4" />
            </button>
          </div>
          {loading && <p>Перевожу…</p>}
          {error && <p className="text-rose-700">{error}</p>}
          {translations?.map((t, i) => <p key={i} className={i ? 'mt-2 border-t border-amber-200 pt-2' : ''}>{t}</p>)}
        </div>
      )}
    </div>
  );
}
