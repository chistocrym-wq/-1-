import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, FileText, Globe, Headphones, Lightbulb, Mic, Newspaper, PenTool } from 'lucide-react';
import type { ModuleId, Progress } from '@/types';
import { ProgressBar } from '@/components/ProgressBar';
import { OttoScene } from '@/components/OttoScene';
import { cn } from '@/lib/utils';
import { languages, translations, type Language } from '../i18n';

interface DashboardProps {
  onSelectModule: (module: ModuleId) => void;
  onOpenInstructions: () => void;
  onOpenExamGuide: () => void;
  onOpenMockExam: () => void;
  onOpenNews: () => void;
  onOpenAccount: () => void;
  progress: Progress;
}

export function Dashboard({ onSelectModule, onOpenInstructions, onOpenExamGuide, onOpenMockExam, onOpenNews, onOpenAccount, progress }: DashboardProps) {
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
    { id: 'horen' as ModuleId, title: t.horenTitle, subtitle: 'Аудирование', icon: Headphones },
    { id: 'schreiben' as ModuleId, title: t.schreibenTitle, subtitle: 'Письмо', icon: PenTool },
    { id: 'sprechen' as ModuleId, title: t.sprechenTitle, subtitle: 'Говорение', icon: Mic },
    { id: 'lesen' as ModuleId, title: t.lesenTitle, subtitle: 'Чтение', icon: BookOpen },
  ];

  const totalStats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    modules.forEach((m) => {
      const p = progress[m.id];
      answered += p?.answered ?? 0;
      correct += p?.correct ?? 0;
    });
    return { answered, accuracy: answered ? Math.round((correct / answered) * 100) : 0 };
  }, [progress]);

  return (
    <div className="otto-dashboard-screen animate-fade-in">
      <section className="otto-home-hero">
        <div className="absolute right-3 top-3 z-30" ref={dropdownRef}>
          <button type="button" onClick={() => setIsOpen((v) => !v)} className="otto-language-button">
            <Globe className="h-4 w-4" /><span>{currentLang.flag}</span><ChevronDown className={cn('h-3.5 w-3.5 transition', isOpen && 'rotate-180')} />
          </button>
          {isOpen && (
            <div className="otto-language-menu">
              {languages.map((item) => (
                <button key={item.id} type="button" onClick={() => { setLang(item.id); setIsOpen(false); }} className={cn('otto-language-item', lang === item.id && 'is-active')}>
                  <span>{item.flag}</span><span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="otto-home-copy">
          <div className="otto-logo-word">Тренажёр OTTO</div>
          <h1>Немецкий A1</h1>
          <p>Ваш помощник · подготовимся к экзамену вместе</p>
          <div className="otto-handwritten">Новый язык.<br />Новые возможности!</div>
        </div>
        <div className="otto-home-character" aria-hidden="true">
          <OttoScene scene="home" className="otto-home-character-scene" />
        </div>
        <div className="otto-hero-skyline" aria-hidden="true" />
      </section>

      <section className="otto-progress-card">
        <div className="otto-progress-ring" style={{ '--progress': `${totalStats.accuracy * 3.6}deg` } as React.CSSProperties}>
          <span>{totalStats.accuracy}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="otto-progress-title">Ваш прогресс</p>
          <p className="otto-progress-subtitle">Немецкий A1 · {totalStats.answered} заданий</p>
          <div className="otto-progress-line"><ProgressBar value={totalStats.accuracy} max={100} /></div>
        </div>
        <button type="button" onClick={onOpenAccount} className="otto-progress-link" aria-label="Открыть мой прогресс">
          <span className="otto-progress-bars"><i /><i /><i /></span>
          <span>Мой<br />прогресс</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      <section id="otto-modules" className="otto-dashboard-section">
        <h2 className="otto-section-title">Учиться с OTTO</h2>
        <div className="otto-module-grid">
          {modules.map(({ id, title, subtitle, icon: Icon }) => (
            <button key={id} type="button" onClick={() => onSelectModule(id)} className="otto-home-module-card">
              <span className="otto-home-module-icon"><Icon /></span>
              <span className="min-w-0 flex-1 text-left"><strong>{title}</strong><small>{subtitle}</small></span>
              <ChevronRight className="otto-card-chevron h-5 w-5 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      <section id="otto-materials" className="otto-dashboard-section">
        <h2 className="otto-section-title">Полезные материалы</h2>
        <div className="otto-materials-grid">
          <button type="button" onClick={onOpenInstructions} className="otto-material-card">
            <span className="otto-material-icon"><FileText /></span><span><strong>Бланки</strong><small>Документы и примеры</small></span><ChevronRight />
          </button>
          <button type="button" onClick={onOpenExamGuide} className="otto-material-card">
            <span className="otto-material-icon"><Lightbulb /></span><span><strong>Советы OTTO</strong><small>Из опыта</small></span><ChevronRight />
          </button>
          <button type="button" onClick={onOpenNews} className="otto-material-card">
            <span className="otto-material-icon"><Newspaper /></span><span><strong>Новости OTTO</strong><small>Полезная информация</small></span><ChevronRight />
          </button>
        </div>
      </section>

      <section className="otto-exam-cta">
        <div className="otto-exam-otto" aria-hidden="true"><OttoScene scene="exam" className="otto-exam-otto-scene" /></div>
        <div className="min-w-0 flex-1">
          <h2>Готовы пройти пробный экзамен?</h2>
          <p>Пробуйте сдать экзамен по времени как на экзамене и становитесь увереннее в своих силах.</p>
        </div>
        <button type="button" onClick={onOpenMockExam} className="otto-exam-button">Начать экзамен <ChevronRight /></button>
      </section>
    </div>
  );
}
