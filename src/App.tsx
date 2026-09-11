import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Instructions } from '@/components/Instructions';
import { ExamGuide } from '@/components/ExamGuide';
import { MockExam } from '@/components/MockExam';
import { ModulesHub } from '@/components/ModulesHub';
import { AccountPage } from '@/components/AccountPage';
import { SettingsPage } from '@/components/SettingsPage';
import { NewsPage } from '@/components/NewsPage';
import { BottomNav, type BottomTab } from '@/components/BottomNav';
import { PageTranslationEye } from '@/components/common/PageTranslationEye';
import { ReadingModule } from '@/components/modules/ReadingModule';
import { ListeningModule } from '@/components/modules/ListeningModule';
import { WritingModule } from '@/components/modules/WritingModule';
import { SpeakingModule } from '@/components/modules/SpeakingModule';
import { useProgress } from '@/hooks/useProgress';
import type { ModuleId } from '@/types';
import { OTTO_CHARACTER_SRC } from './ottoCharacter';
import './ottoDesignV2.css';
import '@/data/lesen/registerExtraSets';

type View = ModuleId | 'instructions' | 'exam-guide' | 'mock-exam' | 'modules' | 'account' | 'settings' | 'news' | null;

export default function App() {
  const [view, setView] = useState<View>(null);
  const { progress, recordScore } = useProgress();
  const back = useCallback(() => setView(null), []);

  useEffect(() => {
    const t = window.Telegram?.WebApp;
    if (t) { t.ready(); t.expand(); }
  }, []);

  useEffect(() => {
    const b = window.Telegram?.WebApp.BackButton;
    if (!b) return;
    if (view === null) { b.hide(); return; }
    b.show();
    b.onClick(back);
    return () => { b.offClick(back); };
  }, [back, view]);

  const complete = (m: ModuleId) => (score: number, total: number) => recordScore(m, score, total);
  const globalEye = view === 'mock-exam';
  const viewClass = `otto-view-${view ?? 'home'}`;

  const activeTab = useMemo<BottomTab>(() => {
    if (view === null || view === 'mock-exam' || view === 'news') return 'home';
    if (view === 'modules' || view === 'lesen' || view === 'horen' || view === 'schreiben' || view === 'sprechen') return 'modules';
    if (view === 'exam-guide' || view === 'instructions') return 'guides';
    if (view === 'account') return 'account';
    return 'settings';
  }, [view]);

  const navigateBottom = useCallback((tab: BottomTab) => {
    if (tab === 'home') setView(null);
    if (tab === 'modules') setView('modules');
    if (tab === 'guides') setView('exam-guide');
    if (tab === 'account') setView('account');
    if (tab === 'settings') setView('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`telegram-app otto-skin ${viewClass} min-h-screen`}>
      <div className="otto-backdrop" aria-hidden="true">
        <div className="otto-glow otto-glow-a" />
        <div className="otto-glow otto-glow-b" />
        <div className="otto-line-art" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-3 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-32">
        {globalEye && <PageTranslationEye scopeId="otto-current-task" />}
        <div id={globalEye ? 'otto-current-task' : undefined} className={view === null ? '' : 'otto-inner-screen'}>
          {view === null && <Dashboard onSelectModule={setView} onOpenInstructions={() => setView('instructions')} onOpenExamGuide={() => setView('exam-guide')} onOpenMockExam={() => setView('mock-exam')} onOpenNews={() => setView('news')} onOpenAccount={() => setView('account')} progress={progress} />}
          {view === 'modules' && <ModulesHub progress={progress} onSelectModule={setView} />}
          {view === 'account' && <AccountPage progress={progress} />}
          {view === 'settings' && <SettingsPage />}
          {view === 'news' && <NewsPage onBack={back} />}
          {view === 'instructions' && <Instructions onBack={back} />}
          {view === 'exam-guide' && <ExamGuide onBack={back} />}
          {view === 'mock-exam' && <MockExam onBack={back} />}
          {view === 'lesen' && <ReadingModule onBack={back} onComplete={complete('lesen')} />}
          {view === 'horen' && <ListeningModule onBack={back} onComplete={complete('horen')} />}
          {view === 'schreiben' && <WritingModule onBack={back} onComplete={complete('schreiben')} />}
          {view === 'sprechen' && <SpeakingModule onBack={back} onComplete={complete('sprechen')} />}
        </div>
      </div>

      {view !== null && view !== 'account' && view !== 'settings' && view !== 'modules' && (
        <div className="otto-companion" aria-hidden="true">
          <div className="otto-companion-crop"><img src={OTTO_CHARACTER_SRC} alt="" /></div>
        </div>
      )}

      <BottomNav active={activeTab} onNavigate={navigateBottom} />
    </div>
  );
}
