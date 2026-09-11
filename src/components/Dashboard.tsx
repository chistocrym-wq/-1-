import { useState, useRef, useEffect } from 'react';
import { BookOpen, Headphones, PenTool, Mic, GraduationCap, Info, Award, FileCheck, Globe, ChevronDown, LockKeyhole } from 'lucide-react';
import type { ModuleId, Progress } from '@/types';
import { ProgressBar } from '@/components/ProgressBar';
import { SubscriptionPanel } from '@/components/SubscriptionPanel';
import type { AccessStatus } from '@/hooks/useAccess';
import { cn } from '@/lib/utils';
import { languages, translations, type Language } from '../i18n';

interface DashboardProps {
  onSelectModule: (module: ModuleId) => void;
  onOpenInstructions: () => void;
  onOpenExamGuide: () => void;
  onOpenMockExam: () => void;
  progress: Progress;
  access: AccessStatus;
  onSubscribe: () => void;
  purchaseLoading: boolean;
  purchaseError: string;
}

export function Dashboard({ onSelectModule, onOpenInstructions, onOpenExamGuide, onOpenMockExam, progress, access, onSubscribe, purchaseLoading, purchaseError }: DashboardProps) {
  const [lang, setLang] = useState<Language>('ru');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  const currentLang = languages.find((l) => l.id === lang) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 px-4 py-6 shadow-xl sm:px-12 sm:py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-white blur-3xl" />
        </div>

        <div className="absolute right-4 top-4 z-20" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/30">
            <Globe className="h-4 w-4 text-white" />
            <span>{currentLang.flag} {currentLang.label}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-white/80 transition-transform duration-200', isOpen && 'rotate-180')} />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-30 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-xl animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Язык интерфейса</div>
              {languages.map((l) => (
                <button key={l.id} onClick={() => { setLang(l.id); setIsOpen(false); }} className={cn('flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-medium transition-colors', lang === l.id ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-700 hover:bg-slate-50')}>
                  <span className="flex items-center gap-2.5"><span className="text-base">{l.flag}</span><span>{l.label}</span></span>
                  <span className="text-[10px] uppercase text-slate-400">{l.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col items-center justify-between gap-6 pt-12 text-center sm:flex-row sm:items-start sm:pt-0 sm:text-left">
          <div className="order-1 flex shrink-0 flex-col items-center sm:order-2">
            <img src="/otto.png" alt="Отто — помощник для изучения немецкого" className="h-44 w-44 rounded-2xl object-contain object-center drop-shadow-2xl sm:h-48 sm:w-48" />
            <div className="mt-2.5 text-center"><p className="text-sm font-semibold text-white/90">{t.assistant}</p><p className="text-xs text-white/75">{t.assistantSub}</p></div>
          </div>

          <div className="order-2 min-w-0 flex-1 sm:order-1">
            <div className="mb-4 flex items-center justify-center gap-3 sm:justify-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"><GraduationCap className="h-7 w-7 text-white" /></div>
              <span className="text-lg font-medium text-white/90">{t.subtitle}</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.title}</h1>
            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-lg">{t.description}</p>
          </div>
        </div>
      </div>

      <SubscriptionPanel access={access} onSubscribe={onSubscribe} purchaseLoading={purchaseLoading} purchaseError={purchaseError} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[
          { id: 'schreiben' as ModuleId, title: t.schreibenTitle, subtitle: t.schreibenSub, desc: t.schreibenDesc, icon: PenTool, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { id: 'sprechen' as ModuleId, title: t.sprechenTitle, subtitle: t.sprechenSub, desc: t.sprechenDesc, icon: Mic, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
          { id: 'lesen' as ModuleId, title: t.lesenTitle, subtitle: t.lesenSub, desc: t.lesenDesc, icon: BookOpen, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
          { id: 'horen' as ModuleId, title: t.horenTitle, subtitle: t.horenSub, desc: t.horenDesc, icon: Headphones, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
        ].map((mod, idx) => {
          const p = progress[mod.id];
          const Icon = mod.icon;
          return (
            <button key={mod.id} onClick={() => onSelectModule(mod.id)} className={cn('group relative overflow-hidden rounded-2xl border-2 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-slide-up', mod.border)} style={{ animationDelay: `${idx * 80}ms` }}>
              <div className="mb-4 flex items-start gap-4">
                <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', mod.bg)}><Icon className={cn('h-7 w-7', mod.color)} /></div>
                <div className="min-w-0 flex-1"><h3 className="text-xl font-bold text-slate-900">{mod.title}</h3><p className="text-sm font-medium text-slate-500">{mod.subtitle}</p></div>
                {p?.completed ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{t.completed}</span> : null}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">{mod.desc}</p>
              {p && <div className="mb-2 flex justify-end"><span className="text-xs font-medium text-slate-400">{t.best}: {p.bestScore}% · {t.attempts}: {p.attempts}</span></div>}
              <ProgressBar value={p?.completed ?? 0} max={1} />
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button onClick={onOpenInstructions} className="group flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-slide-up">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 transition-transform group-hover:scale-110"><Info className="h-6 w-6 text-teal-700" /></div>
          <div><h3 className="font-semibold text-slate-900">{t.instructions}</h3><p className="text-sm text-slate-500">{t.instructionsSub}</p></div>
        </button>

        <button onClick={onOpenExamGuide} className="group relative flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-slide-up" style={{ animationDelay: '60ms' }}>
          {!access.premium && <span className="absolute right-3 top-3 rounded-full bg-amber-100 p-1.5 text-amber-800"><LockKeyhole className="h-3.5 w-3.5" /></span>}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 transition-transform group-hover:scale-110"><Award className="h-6 w-6 text-amber-700" /></div>
          <div><h3 className="font-semibold text-slate-900">{t.examGuide}</h3><p className="text-sm text-slate-500">{t.examGuideSub}</p></div>
        </button>

        <button onClick={onOpenMockExam} className="group relative flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-slide-up" style={{ animationDelay: '120ms' }}>
          {!access.premium && <span className="absolute right-3 top-3 rounded-full bg-amber-100 p-1.5 text-amber-800"><LockKeyhole className="h-3.5 w-3.5" /></span>}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 transition-transform group-hover:scale-110"><FileCheck className="h-6 w-6 text-sky-700" /></div>
          <div><h3 className="font-semibold text-slate-900">{t.mockExam}</h3><p className="text-sm text-slate-500">{t.mockExamSub}</p></div>
        </button>
      </div>
    </div>
  );
}
