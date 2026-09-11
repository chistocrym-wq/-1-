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
    <div className="telegram-app min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {globalEye && <PageTranslationEye scopeId="otto-current-task" />}
        <div id={globalEye ? 'otto-current-task' : undefined}>
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
    </div>
  );
}
