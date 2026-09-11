import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, BookOpen, ChevronDown, FileCheck, Globe, GraduationCap, Headphones, Info, Mic, PenTool } from 'lucide-react';
import type { ModuleId, Progress } from '@/types';
import { ProgressBar } from '@/components/ProgressBar';
import { cn } from '@/lib/utils';
import { languages, translations, type Language } from '../i18n';

interface DashboardProps {
  onSelectModule: (module: ModuleId) => void;
  onOpenInstructions: () => void;
  onOpenExamGuide: () => void;
  onOpenMockExam: () => void;
  progress: Progress;
}

const BRAND = '#0F7D74';

export function Dashboard({ onSelectModule, onOpenInstructions, onOpenExamGuide, onOpenMockExam, progress }: DashboardProps) {
  const [lang, setLang] = useState<Language>('ru');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const currentLang = languages.find((item) => item.id === lang) || languages[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const modules = [
    { id: 'horen' as ModuleId, title: t.horenTitle, subtitle: t.horenSub, desc: t.horenDesc, icon: Headphones },
    { id: 'schreiben' as ModuleId, title: t.schreibenTitle, subtitle: t.schreibenSub, desc: t.schreibenDesc, icon: PenTool },
    { id: 'sprechen' as ModuleId, title: t.sprechenTitle, subtitle: t.sprechenSub, desc: t.sprechenDesc, icon: Mic },
    { id: 'lesen' as ModuleId, title: t.lesenTitle, subtitle: t.lesenSub, desc: t.lesenDesc, icon: BookOpen },
  ];

  const totalStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    for (const m of modules) {
      const p = progress[m.id];
      answered += p?.answered ?? 0;
      correct += p?.correct ?? 0;
    }
    return { answered, correct, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [progress]);

  return (
    <div className="animate-fade-in pb-8">
      <section className="otto-hero relative mb-5 overflow-hidden rounded-[32px] border border-white/70 bg-white/88 px-4 pb-0 pt-5 shadow-[0_18px_55px_rgba(15,125,116,0.16)] backdrop-blur-xl sm:px-8 sm:pt-7">
        <div className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4" ref={dropdownRef}>
          <button type="button" onClick={() => setIsOpen((v) => !v)} className="flex min-h-10 items-center gap-2 rounded-2xl border border-white/90 bg-white/92 px-3 py-2 text-xs font-bold shadow-sm backdrop-blur" style={{ color: BRAND }}>
            <Globe className="h-4 w-4" /><span>{currentLang.flag} {currentLang.label}</span><ChevronDown className={cn('h-3.5 w-3.5 transition', isOpen && 'rotate-180')} />
          </button>
          {isOpen && <div className="absolute right-0 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl">{languages.map((item) => <button key={item.id} type="button" onClick={() => { setLang(item.id); setIsOpen(false); }} className={cn('flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-medium', lang === item.id ? 'otto-soft-accent font-bold' : 'text-slate-700 hover:bg-slate-50')}><span className="flex items-center gap-2"><span>{item.flag}</span>{item.label}</span></button>)}</div>}
        </div>

        <div className="grid min-h-[315px] grid-cols-1 items-end gap-2 pt-10 sm:min-h-[330px] sm:grid-cols-[1.05fr_.95fr] sm:pt-6">
          <div className="relative z-10 self-center pb-5 text-center sm:pb-8 sm:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: BRAND }}><GraduationCap className="h-6 w-6" /></div>
              <span className="text-sm font-black tracking-wide" style={{ color: BRAND }}>Zertifikat A1</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{t.title}</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:mx-0 sm:text-base">{t.description}</p>
            <div className="mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold shadow-sm otto-soft-accent">{t.assistant} · {t.assistantSub}</div>
          </div>

          <div className="relative mx-auto h-[240px] w-full max-w-[330px] overflow-hidden sm:h-[300px]">
            <div className="absolute inset-x-5 bottom-0 top-6 rounded-t-[60px] bg-[radial-gradient(circle_at_50%_20%,rgba(15,125,116,.18),rgba(255,255,255,.3)_58%,transparent_75%)]" />
            <img src="/otto.png" alt="Отто — помощник" className="absolute left-1/2 top-0 h-[390px] w-[390px] max-w-none -translate-x-1/2 object-cover object-top drop-shadow-[0_20px_28px_rgba(15,23,42,.18)] sm:h-[440px] sm:w-[440px]" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        </div>
      </section>

      <section className="otto-card mb-5 rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_12px_35px_rgba(15,23,42,.08)] backdrop-blur">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: BRAND }}>Общий прогресс</p><p className="mt-1 text-2xl font-black text-slate-950">{totalStats.answered} заданий</p></div><div className="text-right"><p className="text-xs text-slate-500">Правильных ответов</p><p className="text-3xl font-black" style={{ color: BRAND }}>{totalStats.accuracy}%</p></div></div>
        <div className="mt-4"><ProgressBar value={totalStats.accuracy} max={100} /></div>
      </section>

      <section className="mb-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onOpenInstructions} className="otto-card group flex min-h-[104px] items-center gap-4 rounded-[26px] border border-white/90 bg-white/94 p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,.07)] transition hover:-translate-y-0.5 hover:shadow-xl"><div className="otto-icon-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"><Info className="h-6 w-6" /></div><div><h2 className="font-black text-slate-950">{t.instructions}</h2><p className="mt-1 text-sm text-slate-500">{t.instructionsSub}</p></div></button>
        <button type="button" onClick={onOpenExamGuide} className="otto-card group flex min-h-[104px] items-center gap-4 rounded-[26px] border border-white/90 bg-white/94 p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,.07)] transition hover:-translate-y-0.5 hover:shadow-xl"><div className="otto-icon-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"><Award className="h-6 w-6" /></div><div><h2 className="font-black text-slate-950">{t.examGuide}</h2><p className="mt-1 text-sm text-slate-500">{t.examGuideSub}</p></div></button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const item = progress[mod.id];
          const Icon = mod.icon;
          const answered = item?.answered ?? 0;
          const accuracy = answered ? Math.round(((item?.correct ?? 0) / answered) * 100) : 0;
          return <button key={mod.id} type="button" onClick={() => onSelectModule(mod.id)} className="otto-card group overflow-hidden rounded-[28px] border border-white/90 bg-white/95 p-5 text-left shadow-[0_12px_34px_rgba(15,23,42,.075)] transition hover:-translate-y-1 hover:shadow-2xl"><div className="mb-4 flex items-start gap-4"><div className="otto-icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"><Icon className="h-7 w-7" /></div><div className="min-w-0 flex-1"><h3 className="text-xl font-black text-slate-950">{mod.title}</h3><p className="text-sm font-medium text-slate-500">{mod.subtitle}</p></div></div><p className="mb-4 text-sm leading-6 text-slate-600">{mod.desc}</p><div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Сделано: {answered}</span><span>Правильно: {accuracy}%</span></div><ProgressBar value={accuracy} max={100} /></button>;
        })}
      </section>

      <section className="mt-5"><button type="button" onClick={onOpenMockExam} className="otto-primary group flex w-full items-center gap-4 rounded-[26px] p-5 text-left text-white shadow-[0_16px_38px_rgba(15,125,116,.25)] transition hover:-translate-y-0.5 hover:shadow-xl"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/16"><FileCheck className="h-6 w-6" /></div><div><h2 className="font-black">{t.mockExam}</h2><p className="mt-1 text-sm text-white/80">{t.mockExamSub} · тайминг как на экзамене</p></div></button></section>
    </div>
  );
}
