import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleX,
  Globe2,
  Mail,
  MapPin,
  RotateCcw,
  Signpost,
} from 'lucide-react';
import {
  lesenExamSets,
  type LesenBinaryAnswer,
  type LesenChoiceAnswer,
  type LesenExamSet,
  type LesenOption,
} from '@/data/lesen/examSets';
import { cn } from '@/lib/utils';

interface ReadingModuleProps {
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

type Part = 1 | 2 | 3;
type Answer = LesenBinaryAnswer | LesenChoiceAnswer;

type PartTask =
  | {
      kind: 'teil1';
      part: 1;
      number: number;
      sourceTitle: string;
      text: string;
      statement: string;
      correct: LesenBinaryAnswer;
      explanation: string;
      visualVariant: number;
    }
  | {
      kind: 'teil2';
      part: 2;
      number: number;
      situation: string;
      a: LesenOption;
      b: LesenOption;
      correct: LesenChoiceAnswer;
      explanation: string;
      visualVariant: number;
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
      visualVariant: number;
    };

interface SavedResult {
  score: number;
  total: number;
  completedAt: string;
}

const STORAGE_KEY = 'otto_lesen_part_results_v2';

const PART_META: Record<Part, {
  title: string;
  subtitle: string;
  format: string;
  description: string;
  icon: typeof Mail;
}> = {
  1: {
    title: 'Briefe & Nachrichten',
    subtitle: 'Teil 1',
    format: '2 Texte · 5 Aufgaben · Richtig/Falsch',
    description: 'Короткие письма, e-mail и сообщения. Нужно понять детали и проверить утверждение.',
    icon: Mail,
  },
  2: {
    title: 'Webseiten & Anzeigen',
    subtitle: 'Teil 2',
    format: '5 Situationen · a oder b',
    description: 'Две страницы, объявления или информационные карточки. Выберите, где есть нужная информация.',
    icon: Globe2,
  },
  3: {
    title: 'Schilder & Hinweise',
    subtitle: 'Teil 3',
    format: '5 Hinweise · Richtig/Falsch',
    description: 'Вывески, режим работы, объявления, таблички и короткие официальные сообщения.',
    icon: Signpost,
  },
};

export function ReadingModule({ onBack, onComplete }: ReadingModuleProps) {
  const [part, setPart] = useState<Part | null>(null);
  const [setIndex, setSetIndex] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const selectedSet = lesenExamSets[setIndex];
  const tasks = useMemo(() => (part && selectedSet ? buildPartTasks(selectedSet, part) : []), [part, selectedSet]);
  const current = tasks[taskIndex];

  const resetAttempt = () => {
    setTaskIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setAnswers({});
    setFinished(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPart = (nextPart: Part) => {
    setPart(nextPart);
    resetAttempt();
  };

  const backToParts = () => {
    setPart(null);
    resetAttempt();
  };

  const changeSet = (nextSetIndex: number) => {
    setSetIndex(nextSetIndex);
    resetAttempt();
  };

  const checkAnswer = () => {
    if (!current || !selectedAnswer) return;
    setAnswers((previous) => ({ ...previous, [current.number]: selectedAnswer === current.correct }));
    setChecked(true);
  };

  const next = () => {
    if (!current || !checked || !part) return;

    if (taskIndex >= tasks.length - 1) {
      const score = Object.values(answers).filter(Boolean).length;
      setFinished(true);
      saveResult(`${selectedSet.id}-teil-${part}`, score, tasks.length);
      onComplete(score, tasks.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setTaskIndex((value) => value + 1);
    setSelectedAnswer(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!part) {
    return <LesenPartsHome onBack={onBack} onOpenPart={openPart} />;
  }

  if (finished) {
    const score = Object.values(answers).filter(Boolean).length;
    return (
      <PartResult
        part={part}
        setIndex={setIndex}
        score={score}
        total={tasks.length}
        onRetry={resetAttempt}
        onChooseSet={() => setFinished(false)}
        onBackToParts={backToParts}
      />
    );
  }

  if (!current) return null;

  const progress = ((taskIndex + 1) / tasks.length) * 100;
  const isCorrect = selectedAnswer === current.correct;

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={backToParts}
          aria-label="Назад к частям Lesen"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Lesen · Teil {part}</p>
              <h1 className="text-xl font-black text-slate-950">{PART_META[part].title}</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">Aufgabe {current.number}</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <SetSelector current={setIndex} onChange={changeSet} />
      <ExamInstruction part={part} />

      {current.kind === 'teil1' && <Teil1Visual task={current} />}
      {current.kind === 'teil2' && <Teil2Visual task={current} />}
      {current.kind === 'teil3' && <Teil3Visual task={current} />}

      <AnswerPanel
        kind={current.kind === 'teil2' ? 'ab' : 'tf'}
        selected={selectedAnswer}
        correctAnswer={current.correct}
        checked={checked}
        onSelect={setSelectedAnswer}
      />

      {checked && (
        <div className={cn('mb-4 rounded-2xl border p-4', isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50')}>
          <div className="flex items-start gap-3">
            {isCorrect ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" /> : <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />}
            <div>
              <p className={cn('font-bold', isCorrect ? 'text-emerald-900' : 'text-rose-900')}>
                {isCorrect ? 'Правильно' : `Неверно. Правильный ответ: ${answerLabel(current.correct)}`}
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
              selectedAnswer ? 'bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-200 text-slate-400'
            )}
          >
            Проверить
          </button>
        ) : (
          <button type="button" onClick={next} className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800">
            {taskIndex === tasks.length - 1 ? 'Показать результат' : 'Следующее задание'}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function LesenPartsHome({ onBack, onOpenPart }: { onBack: () => void; onOpenPart: (part: Part) => void }) {
  const saved = loadResults();

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Назад" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm text-slate-500">Goethe-Zertifikat A1 · экзаменационный формат</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">LESEN</h1>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-slate-700">
        <b className="text-teal-900">Здесь ровно три части, как в тестах:</b> Teil 1 — письма и сообщения, Teil 2 — сайты/объявления с выбором a или b, Teil 3 — вывески и короткие объявления. В каждой части есть несколько оригинальных тренировочных наборов.
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {([1, 2, 3] as Part[]).map((part) => {
          const meta = PART_META[part];
          const Icon = meta.icon;
          const best = bestPartResult(saved, part);
          return (
            <button
              key={part}
              type="button"
              onClick={() => onOpenPart(part)}
              className="group relative min-h-[300px] overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
            >
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-teal-50" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white"><Icon className="h-6 w-6" /></div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-teal-800">Teil {part}</span>
                </div>
                <h2 className="text-xl font-black text-slate-950">{meta.title}</h2>
                <p className="mt-2 text-sm font-semibold text-teal-700">{meta.format}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{meta.description}</p>
                <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  {lesenExamSets.length} тренировочных наборов · оригинальные тексты Otto
                  {best ? <div className="mt-1 font-bold text-slate-700">Лучший результат: {best.score}/{best.total}</div> : null}
                </div>
                <div className="mt-5 inline-flex items-center gap-2 font-bold text-slate-900">Открыть Teil {part}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SetSelector({ current, onChange }: { current: number; onChange: (index: number) => void }) {
  return (
    <div className="mb-4 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-2">
        {lesenExamSets.map((set, index) => (
          <button
            key={set.id}
            type="button"
            onClick={() => onChange(index)}
            className={cn(
              'min-h-10 rounded-xl border px-4 py-2 text-sm font-bold transition',
              current === index ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
            )}
          >
            Вариант {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExamInstruction({ part }: { part: Part }) {
  const german = part === 1
    ? 'Lesen Sie die Texte und die Aufgaben 1 bis 5. Kreuzen Sie an: Richtig oder Falsch.'
    : part === 2
      ? 'Lesen Sie die Texte und die Aufgaben 6 bis 10. Wo finden Sie Informationen? Kreuzen Sie an: a oder b.'
      : 'Lesen Sie die Texte und die Aufgaben 11 bis 15. Kreuzen Sie an: Richtig oder Falsch.';

  return (
    <div className="mb-4 rounded-xl border-l-4 border-slate-600 bg-slate-100 px-4 py-3 font-serif text-[15px] leading-6 text-slate-700">
      <span className="mr-2 font-bold">Teil {part}</span>{german}
    </div>
  );
}

function Teil1Visual({ task }: { task: Extract<PartTask, { kind: 'teil1' }> }) {
  const variant = task.visualVariant % 3;

  return (
    <div className="mb-4 rounded-[20px] border border-slate-300 bg-[#fbfaf6] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Aufgabe {task.number}</span>
        <span className="text-xs font-semibold text-slate-400">{task.sourceTitle}</span>
      </div>

      {variant === 0 && <MailWindow title={task.sourceTitle} text={task.text} />}
      {variant === 1 && <LetterPaper title={task.sourceTitle} text={task.text} />}
      {variant === 2 && <MessageCard title={task.sourceTitle} text={task.text} />}

      <div className="mt-5 flex gap-3 border-t border-slate-200 pt-4">
        <span className="text-2xl font-black text-slate-900">{task.number}</span>
        <p className="pt-1 font-serif text-[17px] leading-7 text-slate-900">{task.statement}</p>
      </div>
    </div>
  );
}

function MailWindow({ title, text }: { title: string; text: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-500 bg-white shadow-[4px_5px_0_rgba(15,23,42,0.10)]">
      <div className="flex items-center gap-2 border-b border-slate-400 bg-slate-200 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
        <span className="ml-2 text-[11px] font-bold text-slate-600">Postfach · Nachricht</span>
      </div>
      <div className="border-b border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-500"><b>Betreff:</b> {title}</div>
      <div className="whitespace-pre-line p-5 font-serif text-[16px] leading-7 text-slate-800">{text}</div>
    </div>
  );
}

function LetterPaper({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl rotate-[0.25deg] border border-stone-300 bg-[#fffefb] p-5 shadow-[6px_7px_0_rgba(120,113,108,0.12)] sm:p-7">
      <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-2 text-[11px] uppercase tracking-[0.14em] text-stone-400"><span>{title}</span><span>✉</span></div>
      <div className="whitespace-pre-line font-serif text-[16px] leading-7 text-slate-800">{text}</div>
      <div className="mt-5 flex justify-end"><div className="h-7 w-20 border-b-2 border-double border-stone-300" /></div>
    </div>
  );
}

function MessageCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-[22px] border border-slate-300 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-800">N</div><div><p className="text-xs text-slate-400">Nachricht</p><p className="text-sm font-bold text-slate-800">{title}</p></div></div>
      <div className="whitespace-pre-line px-5 py-5 font-serif text-[16px] leading-7 text-slate-800">{text}</div>
    </div>
  );
}

function Teil2Visual({ task }: { task: Extract<PartTask, { kind: 'teil2' }> }) {
  return (
    <div className="mb-4 rounded-[20px] border border-slate-300 bg-[#fbfaf6] p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="text-2xl font-black text-slate-900">{task.number}</span>
        <p className="pt-1 font-serif text-[17px] font-semibold leading-7 text-slate-900">{task.situation}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SourceCard letter="a" option={task.a} variant={task.visualVariant} />
        <SourceCard letter="b" option={task.b} variant={task.visualVariant + 1} />
      </div>
    </div>
  );
}

function SourceCard({ letter, option, variant }: { letter: 'a' | 'b'; option: LesenOption; variant: number }) {
  const mode = variant % 4;

  if (mode === 1) {
    return (
      <div className="relative min-h-[185px] rotate-[-0.35deg] border border-slate-400 bg-[#fffef7] p-4 shadow-[4px_5px_0_rgba(15,23,42,0.09)]">
        <div className="mb-3 border-b-2 border-slate-800 pb-2 text-center font-serif text-lg font-black text-slate-900">{option.heading}</div>
        <p className="whitespace-pre-line text-center font-serif text-[15px] leading-6 text-slate-800">{option.text}</p>
        <div className="mt-4 text-center text-[11px] font-bold text-slate-500">{option.label}</div>
        <LetterBadge letter={letter} />
      </div>
    );
  }

  if (mode === 2) {
    return (
      <div className="relative min-h-[185px] border-2 border-dashed border-slate-400 bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Anzeige</div>
        <div className="font-serif text-lg font-black text-slate-950">{option.heading}</div>
        <p className="mt-3 whitespace-pre-line font-serif text-[15px] leading-6 text-slate-700">{option.text}</p>
        <div className="mt-3 border-t border-slate-200 pt-2 text-[11px] font-semibold text-slate-500">{option.label}</div>
        <LetterBadge letter={letter} />
      </div>
    );
  }

  if (mode === 3) {
    return (
      <div className="relative min-h-[185px] overflow-hidden border border-slate-400 bg-white shadow-sm">
        <div className="bg-slate-800 px-3 py-2 text-xs font-bold text-white">INFO · {option.label}</div>
        <div className="p-4 text-center"><div className="font-serif text-lg font-black text-slate-950">{option.heading}</div><p className="mt-3 whitespace-pre-line font-serif text-[15px] leading-6 text-slate-700">{option.text}</p></div>
        <LetterBadge letter={letter} />
      </div>
    );
  }

  return (
    <div className="relative min-h-[185px] overflow-hidden border border-slate-400 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-300 bg-slate-200 px-2 py-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /><span className="h-2 w-2 rounded-full bg-slate-400" /><div className="ml-1 flex-1 truncate rounded-sm border border-slate-300 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-500">{option.label}</div></div>
      <div className="p-4 text-center font-serif"><div className="text-lg font-black text-slate-950">{option.heading}</div><p className="mt-3 whitespace-pre-line text-[15px] leading-6 text-slate-700">{option.text}</p></div>
      <LetterBadge letter={letter} />
    </div>
  );
}

function LetterBadge({ letter }: { letter: 'a' | 'b' }) {
  return <div className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center border border-slate-700 bg-white font-serif font-black text-slate-900">{letter}</div>;
}

function Teil3Visual({ task }: { task: Extract<PartTask, { kind: 'teil3' }> }) {
  const variant = task.visualVariant % 4;

  return (
    <div className="mb-4 rounded-[20px] border border-slate-300 bg-[#fbfaf6] p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-serif italic text-slate-600"><MapPin className="h-4 w-4" />{task.place}</div>

      <div className="flex min-h-[200px] items-center justify-center py-3">
        {variant === 0 && <NoticeSign heading={task.heading} text={task.text} />}
        {variant === 1 && <DoorNote heading={task.heading} text={task.text} />}
        {variant === 2 && <InfoPlaque heading={task.heading} text={task.text} />}
        {variant === 3 && <ScheduleBoard heading={task.heading} text={task.text} />}
      </div>

      <div className="mt-5 flex gap-3 border-t border-slate-200 pt-4">
        <span className="text-2xl font-black text-slate-900">{task.number}</span>
        <p className="pt-1 font-serif text-[17px] leading-7 text-slate-900">{task.statement}</p>
      </div>
    </div>
  );
}

function NoticeSign({ heading, text }: { heading: string; text: string }) {
  return <div className="w-full max-w-lg -rotate-1 border-4 border-slate-600 bg-white px-6 py-6 text-center shadow-[6px_7px_0_rgba(15,23,42,0.12)]"><div className="font-serif text-xl font-black uppercase tracking-wide text-slate-950">{heading}</div><p className="mt-3 whitespace-pre-line font-serif text-[16px] font-semibold leading-7 text-slate-800">{text}</p></div>;
}

function DoorNote({ heading, text }: { heading: string; text: string }) {
  return <div className="relative w-full max-w-md rotate-[1deg] border border-stone-300 bg-[#fffdf2] px-6 py-7 text-center shadow-lg before:absolute before:-top-3 before:left-1/2 before:h-6 before:w-20 before:-translate-x-1/2 before:bg-amber-100/80"><div className="font-serif text-lg font-black text-slate-950">{heading}</div><p className="mt-3 whitespace-pre-line font-serif text-[16px] leading-7 text-slate-800">{text}</p></div>;
}

function InfoPlaque({ heading, text }: { heading: string; text: string }) {
  return <div className="w-full max-w-lg overflow-hidden rounded-sm border-2 border-slate-700 bg-white shadow-md"><div className="bg-slate-800 px-4 py-2 text-center text-sm font-black uppercase tracking-[0.15em] text-white">{heading}</div><p className="whitespace-pre-line px-6 py-6 text-center font-serif text-[16px] leading-7 text-slate-800">{text}</p></div>;
}

function ScheduleBoard({ heading, text }: { heading: string; text: string }) {
  return <div className="w-full max-w-lg border border-slate-400 bg-white shadow-[4px_5px_0_rgba(15,23,42,0.08)]"><div className="border-b border-slate-400 bg-slate-100 px-4 py-2 font-serif text-lg font-black text-slate-950">{heading}</div><div className="grid grid-cols-[36px_1fr] gap-3 p-5"><div className="flex items-start justify-center pt-1 text-2xl">ⓘ</div><p className="whitespace-pre-line font-serif text-[16px] leading-7 text-slate-800">{text}</p></div></div>;
}

function AnswerPanel({ kind, selected, correctAnswer, checked, onSelect }: { kind: 'tf' | 'ab'; selected: Answer | null; correctAnswer: Answer; checked: boolean; onSelect: (answer: Answer) => void }) {
  const options: Array<{ value: Answer; label: string }> = kind === 'ab'
    ? [{ value: 'a', label: 'a' }, { value: 'b', label: 'b' }]
    : [{ value: 'richtig', label: 'Richtig' }, { value: 'falsch', label: 'Falsch' }];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = selected === option.value;
        const correct = checked && option.value === correctAnswer;
        const wrong = checked && isSelected && option.value !== correctAnswer;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !checked && onSelect(option.value)}
            disabled={checked}
            className={cn(
              'min-h-[52px] rounded-xl border-2 bg-white px-4 py-3 font-serif text-base font-black transition',
              !checked && !isSelected && 'border-slate-300 hover:border-slate-500',
              !checked && isSelected && 'border-slate-900 bg-slate-100',
              correct && 'border-emerald-600 bg-emerald-50 text-emerald-900',
              wrong && 'border-rose-500 bg-rose-50 text-rose-900',
              checked && !correct && !wrong && 'border-slate-200 text-slate-400'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PartResult({ part, setIndex, score, total, onRetry, onChooseSet, onBackToParts }: { part: Part; setIndex: number; score: number; total: number; onRetry: () => void; onChooseSet: () => void; onBackToParts: () => void }) {
  const percent = Math.round((score / total) * 100);
  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5 flex items-center gap-3"><button type="button" onClick={onBackToParts} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white" aria-label="Назад"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-sm text-slate-500">Lesen · Teil {part} · Вариант {setIndex + 1}</p><h1 className="text-2xl font-black text-slate-950">Результат</h1></div></div>
      <div className="rounded-[24px] border border-slate-300 bg-white p-7 text-center shadow-sm"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-teal-600"><div><div className="text-3xl font-black text-slate-950">{score}/{total}</div><div className="text-sm font-bold text-teal-700">{percent}%</div></div></div><h2 className="mt-5 text-xl font-black text-slate-950">{percent >= 80 ? 'Отлично' : percent >= 60 ? 'Хорошая база' : 'Эту часть стоит повторить'}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Повторите ошибки или выберите другой вариант этой же экзаменационной части.</p></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onBackToParts} className="min-h-[50px] rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700">К трём частям</button><button type="button" onClick={onChooseSet} className="min-h-[50px] rounded-xl border border-teal-300 bg-teal-50 px-5 py-3 font-semibold text-teal-900">Другой вариант</button><button type="button" onClick={onRetry} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"><RotateCcw className="h-4 w-4" />Ещё раз</button></div>
    </div>
  );
}

function buildPartTasks(set: LesenExamSet, part: Part): PartTask[] {
  if (part === 1) {
    let number = 1;
    const result: PartTask[] = [];
    set.teil1.forEach((block, blockIndex) => {
      block.statements.forEach((item) => {
        result.push({ kind: 'teil1', part: 1, number, sourceTitle: block.title, text: block.text, statement: item.statement, correct: item.correct, explanation: item.explanation, visualVariant: blockIndex + number - 1 });
        number += 1;
      });
    });
    return result;
  }

  if (part === 2) {
    return set.teil2.map((item, index) => ({ kind: 'teil2', part: 2, number: index + 6, situation: item.situation, a: item.a, b: item.b, correct: item.correct, explanation: item.explanation, visualVariant: index }));
  }

  return set.teil3.map((item, index) => ({ kind: 'teil3', part: 3, number: index + 11, place: item.place, heading: item.heading, text: item.text, statement: item.statement, correct: item.correct, explanation: item.explanation, visualVariant: index }));
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

function saveResult(key: string, score: number, total: number) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadResults();
    current[key] = { score, total, completedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // localStorage can be blocked in some embedded browsers.
  }
}

function bestPartResult(results: Record<string, SavedResult>, part: Part) {
  return Object.entries(results)
    .filter(([key]) => key.endsWith(`teil-${part}`))
    .map(([, value]) => value)
    .sort((a, b) => (b.score / b.total) - (a.score / a.total))[0];
}
