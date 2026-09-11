import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Instructions } from '@/components/Instructions';
import { ExamGuide } from '@/components/ExamGuide';
import { MockExam } from '@/components/MockExam';
import { PageTranslationEye } from '@/components/common/PageTranslationEye';
import { ReadingModule } from '@/components/modules/ReadingModule';
import { ListeningModule } from '@/components/modules/ListeningModule';
import { WritingModule } from '@/components/modules/WritingModule';
import { SpeakingModule } from '@/components/modules/SpeakingModule';
import { useProgress } from '@/hooks/useProgress';
import type { ModuleId } from '@/types';
import '@/data/lesen/registerExtraSets';

type View = ModuleId | 'instructions' | 'exam-guide' | 'mock-exam' | null;

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
    return () => b.offClick(back);
  }, [back, view]);

  const complete = (m: ModuleId) => (score: number, total: number) => recordScore(m, score, total);
  const globalEye = view === 'mock-exam';

  return (
    <div className="telegram-app otto-skin min-h-screen">
      <div className="otto-backdrop" aria-hidden="true">
        <div className="otto-glow otto-glow-a" />
        <div className="otto-glow otto-glow-b" />
        <div className="otto-line-art" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
        {globalEye && <PageTranslationEye scopeId="otto-current-task" />}
        <div id={globalEye ? 'otto-current-task' : undefined} className={view === null ? '' : 'otto-inner-screen'}>
          {view === null && <Dashboard onSelectModule={setView} onOpenInstructions={() => setView('instructions')} onOpenExamGuide={() => setView('exam-guide')} onOpenMockExam={() => setView('mock-exam')} progress={progress} />}
          {view === 'instructions' && <Instructions onBack={back} />}
          {view === 'exam-guide' && <ExamGuide onBack={back} />}
          {view === 'mock-exam' && <MockExam onBack={back} />}
          {view === 'lesen' && <ReadingModule onBack={back} onComplete={complete('lesen')} />}
          {view === 'horen' && <ListeningModule onBack={back} onComplete={complete('horen')} />}
          {view === 'schreiben' && <WritingModule onBack={back} onComplete={complete('schreiben')} />}
          {view === 'sprechen' && <SpeakingModule onBack={back} onComplete={complete('sprechen')} />}
        </div>
      </div>

      {view !== null && (
        <div className="otto-companion" aria-hidden="true">
          <div className="otto-companion-crop">
            <img src="/otto.png" alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
