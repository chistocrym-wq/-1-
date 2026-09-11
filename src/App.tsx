import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Instructions } from '@/components/Instructions';
import { ExamGuide } from '@/components/ExamGuide';
import { MockExam } from '@/components/MockExam';
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
  const { progress, recordScore, markCompleted } = useProgress();

  const handleBack = useCallback(() => {
    setView(null);
  }, []);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (!telegram) return;
    telegram.ready();
    telegram.expand();
  }, []);

  useEffect(() => {
    const backButton = window.Telegram?.WebApp.BackButton;
    if (!backButton) return;

    if (view === null) {
      backButton.hide();
      return;
    }

    backButton.show();
    backButton.onClick(handleBack);
    return () => {
      backButton.offClick(handleBack);
    };
  }, [handleBack, view]);

  const handleComplete = (mod: ModuleId) => (score: number, total: number) => {
    if (mod === 'sprechen') {
      markCompleted(mod, total);
    } else {
      recordScore(mod, score, total);
    }
  };

  return (
    <div className="telegram-app min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        {view === null && (
          <Dashboard
            onSelectModule={(mod) => setView(mod)}
            onOpenInstructions={() => setView('instructions')}
            onOpenExamGuide={() => setView('exam-guide')}
            onOpenMockExam={() => setView('mock-exam')}
            progress={progress}
          />
        )}
        {view === 'instructions' && <Instructions onBack={handleBack} />}
        {view === 'exam-guide' && <ExamGuide onBack={handleBack} />}
        {view === 'mock-exam' && <MockExam onBack={handleBack} />}
        {view === 'lesen' && (
          <ReadingModule onBack={handleBack} onComplete={handleComplete('lesen')} />
        )}
        {view === 'horen' && (
          <ListeningModule onBack={handleBack} onComplete={handleComplete('horen')} />
        )}
        {view === 'schreiben' && (
          <WritingModule onBack={handleBack} onComplete={handleComplete('schreiben')} />
        )}
        {view === 'sprechen' && (
          <SpeakingModule onBack={handleBack} onComplete={handleComplete('sprechen')} />
        )}
      </div>
    </div>
  );
}
