import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleX,
  RotateCcw,
} from 'lucide-react';
import {
  lesenExamSets,
  type LesenBinaryAnswer,
  type LesenChoiceAnswer,
  type LesenExamSet,
} from '@/data/lesen/examSets';
import { cn } from '@/lib/utils';

interface ReadingModuleProps {
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

type Answer = LesenBinaryAnswer | LesenChoiceAnswer;

type Step =
  | {
      kind: 'teil1';
      part: 1;
      number: number;
      sourceTitle: string;
      text: string;
      statement: string;
      correct: LesenBinaryAnswer;
      explanation: string;
    }
  | {
      kind: 'teil2';
      part: 2;
      number: number;
      situation: string;
      a: LesenExamSet['teil2'][number]['a'];
      b: LesenExamSet['teil2'][number]['b'];
      correct: LesenChoiceAnswer;
      explanation: string;
    }
  | {
      kind: 'teil3';
      part: 3;
      number: number;
      place: string;
      heading: string;
      text: string;
      statement: string;
      correct: LesenBinaryAnswer;
      explanation: string;
    };

interface SavedResult {
  score: number;
  total: number;
  completedAt: string;
}

const STORAGE_KEY = 'otto_lesen_exam_results_v1';

export function ReadingModule({ onBack, onComplete }: ReadingModuleProps) {
  const [selectedSet, setSelectedSet] = useState<LesenExamSet | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const steps = useMemo(() => (selectedSet ? buildSteps(selectedSet) : []), [selectedSet]);
  const current = steps[stepIndex];

  const startSet = (set: LesenExamSet) => {
    setSelectedSet(set);
    setStepIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setAnswers({});
    setFinished(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToSets = () => {
    setSelectedSet(null);
    setStepIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setAnswers({});
    setFinished(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkAnswer = () => {
    if (!current || !selectedAnswer) return;
    const isCorrect = selectedAnswer === current.correct;
    setAnswers((prev) => ({ ...prev, [current.number]: isCorrect }));
    setChecked(true);
  };

  const next = () => {
    if (!current || !checked) return;
    if (stepIndex >= steps.length - 1) {
      const score = Object.values(answers).filter(Boolean).length;
      setFinished(true);
      if (selectedSet) saveResult(selectedSet.id, score, steps.length);
      onComplete(score, steps.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStepIndex((value) => value + 1);
    setSelectedAnswer(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedSet) {
    return <LesenSetHome onBack={onBack} onStart={startSet} />;
  }

  if (finished) {
    const score = Object.values(answers).filter(Boolean).length;
    return (
      <ResultScreen
        set={selectedSet}
        steps={steps}
        answers={answers}
        score={score}
        onRetry={() => startSet(selectedSet)}
        onChooseAnother={backToSets}
      />
    );
  }

  if (!current) return null;

  const correct = selectedAnswer === current.correct;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={backToSets}
          aria-label="Назад к тестам Lesen"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {selectedSet.title}
              </p>
              <h1 className="text-2xl font-bold text-slate-950">Lesen · Teil {current.part}</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">Aufgabe {current.number} von 15</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-700 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <ExamInstruction part={current.part} />

      {current.kind === 'teil1' && <Teil1Paper step={current} />}
      {current.kind === 'teil2' && <Teil2Paper step={current} />}
      {current.kind === 'teil3' && <Teil3Paper step={current} />}

      <AnswerPanel
        kind={current.kind === 'teil2' ? 'ab' : 'tf'}
        selected={selectedAnswer}
        correctAnswer={current.correct}
        checked={checked}
        onSelect={setSelectedAnswer}
      />

      {checked && (
        <div
          className={cn(
            'mb-4 rounded-2xl border p-4',
            correct
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50'
          )}
        >
          <div className="flex items-start gap-3">
            {correct ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            ) : (
              <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
            )}
            <div>
              <p className={cn('font-bold', correct ? 'text-emerald-900' : 'text-rose-900')}>
                {correct ? 'Правильно' : `Неверно. Правильный ответ: ${answerLabel(current.correct)}`}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{current.explanation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {!checked ? (
          <button
            type="button"
            onClick={checkAnswer}
            disabled={!selectedAnswer}
            className={cn(
              'min-h-[50px] rounded-xl px-6 py-3 font-semibold transition',
              selectedAnswer
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            )}
          >
            Проверить
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
          >
            {stepIndex === steps.length - 1 ? 'Показать результат' : 'Следующее задание'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function LesenSetHome({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (set: LesenExamSet) => void;
}) {
  const saved = loadResults();

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm text-slate-500">Goethe-Zertifikat A1 · Training</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">LESEN</h1>
        </div>
      </div>

      <div className="mb-6 overflow-hidden border border-slate-300 bg-white shadow-sm">
        <div className="bg-slate-700 px-5 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
          A1 · LESEN · ÜBUNGSSATZ
        </div>
        <div className="border-t-4 border-slate-300 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-4">
            <BookOpen className="mt-1 h-6 w-6 shrink-0 text-slate-500" />
            <div>
              <p className="font-serif text-[17px] leading-7 text-slate-800">
                Dieser Test hat drei Teile. Sie lesen kurze Briefe, Anzeigen, Internetseiten und Hinweise.
                Zu jedem Text gibt es Aufgaben. Kreuzen Sie die richtige Lösung an.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Формат собран по взрослому Start Deutsch 1: 3 части, 15 заданий, около 25 минут. Все тексты и задания в Otto оригинальные.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {lesenExamSets.map((set) => {
          const previous = saved[set.id];
          return (
            <button
              key={set.id}
              type="button"
              onClick={() => onStart(set)}
              className="group min-h-[230px] border border-slate-300 bg-[#fbfbfa] p-5 text-left shadow-[3px_3px_0_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_rgba(15,23,42,0.12)]"
            >
              <div className="mb-5 flex items-center justify-between border-b border-slate-300 pb-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Lesen</span>
                <span className="text-xs font-semibold text-slate-400">15 Aufgaben</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-950">{set.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{set.subtitle}</p>
              <div className="mt-5 border-t border-dashed border-slate-300 pt-4 text-sm">
                {previous ? (
                  <span className="font-semibold text-slate-700">
                    Последний результат: {previous.score}/{previous.total}
                  </span>
                ) : (
                  <span className="text-slate-400">Ещё не пройден</span>
                )}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 font-semibold text-slate-900">
                Начать
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExamInstruction({ part }: { part: 1 | 2 | 3 }) {
  const text =
    part === 1
      ? 'Lesen Sie den Text und die Aussage. Kreuzen Sie an: Richtig oder Falsch.'
      : part === 2
        ? 'Wo finden Sie die passende Information? Kreuzen Sie an: a oder b.'
        : 'Lesen Sie den Hinweis und die Aussage. Kreuzen Sie an: Richtig oder Falsch.';

  return (
    <div className="mb-4 border-l-4 border-slate-500 bg-slate-100 px-4 py-3 font-serif text-[15px] leading-6 text-slate-700">
      <span className="mr-2 font-bold">Teil {part}</span>
      {text}
    </div>
  );
}

function PaperHeader({ right }: { right: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] text-xs font-bold uppercase tracking-wide text-white">
      <div className="bg-slate-700 px-3 py-2">A1 · Lesen Training</div>
      <div className="bg-slate-600 px-3 py-2">{right}</div>
    </div>
  );
}

function Teil1Paper({ step }: { step: Extract<Step, { kind: 'teil1' }> }) {
  return (
    <div className="mb-4 overflow-hidden border border-slate-400 bg-[#fffefb] shadow-[3px_3px_0_rgba(15,23,42,0.12)]">
      <PaperHeader right={`Aufgabe ${step.number}`} />
      <div className="p-5 sm:p-7">
        <div className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{step.sourceTitle}</div>
        <div className="border border-slate-300 bg-white p-5 font-serif text-[17px] leading-7 text-slate-800 whitespace-pre-line">
          {step.text}
        </div>
        <div className="mt-5 flex gap-3">
          <span className="text-2xl font-bold text-slate-900">{step.number}</span>
          <p className="pt-1 font-serif text-[17px] leading-7 text-slate-900">{step.statement}</p>
        </div>
      </div>
    </div>
  );
}

function Teil2Paper({ step }: { step: Extract<Step, { kind: 'teil2' }> }) {
  return (
    <div className="mb-4 overflow-hidden border border-slate-400 bg-[#fffefb] shadow-[3px_3px_0_rgba(15,23,42,0.12)]">
      <PaperHeader right={`Aufgabe ${step.number}`} />
      <div className="p-5 sm:p-7">
        <div className="mb-5 flex gap-3">
          <span className="text-2xl font-bold text-slate-900">{step.number}</span>
          <p className="pt-1 font-serif text-[17px] font-semibold leading-7 text-slate-900">{step.situation}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <WebAd letter="a" option={step.a} />
          <WebAd letter="b" option={step.b} />
        </div>
      </div>
    </div>
  );
}

function WebAd({
  letter,
  option,
}: {
  letter: 'a' | 'b';
  option: LesenExamSet['teil2'][number]['a'];
}) {
  return (
    <div className="relative border border-slate-500 bg-white">
      <div className="border-b border-slate-400 bg-slate-200 px-3 py-1.5 font-mono text-[11px] text-slate-600">
        {option.label}
      </div>
      <div className="min-h-[145px] p-4 text-center font-serif text-slate-800">
        <div className="text-lg font-bold">{option.heading}</div>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-6">{option.text}</p>
      </div>
      <div className="absolute -bottom-3 left-3 flex h-7 w-7 items-center justify-center border border-slate-700 bg-white font-serif font-bold text-slate-900">
        {letter}
      </div>
    </div>
  );
}

function Teil3Paper({ step }: { step: Extract<Step, { kind: 'teil3' }> }) {
  return (
    <div className="mb-4 overflow-hidden border border-slate-400 bg-[#fffefb] shadow-[3px_3px_0_rgba(15,23,42,0.12)]">
      <PaperHeader right={`Aufgabe ${step.number}`} />
      <div className="p-5 sm:p-7">
        <div className="mb-3 font-serif text-sm italic text-slate-600">{step.place}</div>
        <div className="mx-auto max-w-lg -rotate-1 border-2 border-slate-500 bg-white px-6 py-5 text-center shadow-sm">
          <div className="font-serif text-xl font-bold uppercase tracking-wide text-slate-900">{step.heading}</div>
          <p className="mt-3 whitespace-pre-line font-serif text-[16px] leading-7 text-slate-800">{step.text}</p>
        </div>
        <div className="mt-7 flex gap-3">
          <span className="text-2xl font-bold text-slate-900">{step.number}</span>
          <p className="pt-1 font-serif text-[17px] leading-7 text-slate-900">{step.statement}</p>
        </div>
      </div>
    </div>
  );
}

function AnswerPanel({
  kind,
  selected,
  correctAnswer,
  checked,
  onSelect,
}: {
  kind: 'tf' | 'ab';
  selected: Answer | null;
  correctAnswer: Answer;
  checked: boolean;
  onSelect: (answer: Answer) => void;
}) {
  const options: Array<{ value: Answer; label: string }> =
    kind === 'ab'
      ? [
          { value: 'a', label: 'a' },
          { value: 'b', label: 'b' },
        ]
      : [
          { value: 'richtig', label: 'Richtig' },
          { value: 'falsch', label: 'Falsch' },
        ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = selected === option.value;
        const isCorrect = checked && option.value === correctAnswer;
        const isWrong = checked && isSelected && option.value !== correctAnswer;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !checked && onSelect(option.value)}
            disabled={checked}
            className={cn(
              'min-h-[52px] border-2 bg-white px-4 py-3 font-serif text-base font-bold transition',
              !checked && !isSelected && 'border-slate-300 hover:border-slate-500',
              !checked && isSelected && 'border-slate-800 bg-slate-100',
              isCorrect && 'border-emerald-600 bg-emerald-50 text-emerald-900',
              isWrong && 'border-rose-500 bg-rose-50 text-rose-900',
              checked && !isCorrect && !isWrong && 'border-slate-200 text-slate-400'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function ResultScreen({
  set,
  steps,
  answers,
  score,
  onRetry,
  onChooseAnother,
}: {
  set: LesenExamSet;
  steps: Step[];
  answers: Record<number, boolean>;
  score: number;
  onRetry: () => void;
  onChooseAnother: () => void;
}) {
  const percent = Math.round((score / steps.length) * 100);
  const partScores = [1, 2, 3].map((part) => {
    const partSteps = steps.filter((step) => step.part === part);
    const correct = partSteps.filter((step) => answers[step.number]).length;
    return { part, correct, total: partSteps.length };
  });

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onChooseAnother}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white"
          aria-label="Назад к тестам"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm text-slate-500">{set.title}</p>
          <h1 className="text-2xl font-bold text-slate-950">Результат Lesen</h1>
        </div>
      </div>

      <div className="mb-5 overflow-hidden border border-slate-400 bg-[#fffefb] shadow-[3px_3px_0_rgba(15,23,42,0.12)]">
        <div className="bg-slate-700 px-5 py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
          A1 · LESEN · ERGEBNIS
        </div>
        <div className="p-6 text-center sm:p-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-700 bg-white">
            <div>
              <div className="text-3xl font-black text-slate-950">{score}/15</div>
              <div className="text-sm font-semibold text-slate-500">{percent}%</div>
            </div>
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">
            {percent >= 80 ? 'Очень хороший результат' : percent >= 60 ? 'Зачётный уровень' : 'Нужно ещё потренироваться'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            В тренажёре порог 60% используется только как ориентир. Посмотрите, в какой части было больше ошибок, и повторите её.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {partScores.map((item) => (
          <div key={item.part} className="border border-slate-300 bg-white p-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Teil {item.part}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{item.correct}/{item.total}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onChooseAnother}
          className="min-h-[50px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
        >
          Выбрать другой тест
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Пройти ещё раз
        </button>
      </div>
    </div>
  );
}

function buildSteps(set: LesenExamSet): Step[] {
  const result: Step[] = [];
  let number = 1;

  for (const block of set.teil1) {
    for (const item of block.statements) {
      result.push({
        kind: 'teil1',
        part: 1,
        number,
        sourceTitle: block.title,
        text: block.text,
        statement: item.statement,
        correct: item.correct,
        explanation: item.explanation,
      });
      number += 1;
    }
  }

  for (const item of set.teil2) {
    result.push({
      kind: 'teil2',
      part: 2,
      number,
      situation: item.situation,
      a: item.a,
      b: item.b,
      correct: item.correct,
      explanation: item.explanation,
    });
    number += 1;
  }

  for (const item of set.teil3) {
    result.push({
      kind: 'teil3',
      part: 3,
      number,
      place: item.place,
      heading: item.heading,
      text: item.text,
      statement: item.statement,
      correct: item.correct,
      explanation: item.explanation,
    });
    number += 1;
  }

  return result;
}

function answerLabel(answer: Answer) {
  if (answer === 'richtig') return 'Richtig';
  if (answer === 'falsch') return 'Falsch';
  return answer;
}

function loadResults(): Record<string, SavedResult> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveResult(setId: string, score: number, total: number) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadResults();
    current[setId] = {
      score,
      total,
      completedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // localStorage может быть недоступен в приватном режиме. Сам тренажёр продолжает работать.
  }
}
