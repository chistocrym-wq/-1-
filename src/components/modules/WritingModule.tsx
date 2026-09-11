import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  HelpCircle,
  Loader2,
  PenLine,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { schreibenTeil1Tasks } from '@/data/schreiben/teil1';
import { schreibenTeil2Tasks } from '@/data/schreiben/teil2';
import { cn } from '@/lib/utils';

interface WritingModuleProps {
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

type Screen = 'home' | 'teil1' | 'teil2';

type ScoreMap = Record<string, number>;
type FormDrafts = Record<string, Record<number, string>>;
type LetterDrafts = Record<string, string>;

interface AiPoint {
  point: string;
  earned: number;
  status: 'erfuellt' | 'teilweise' | 'fehlt';
  commentRu: string;
}

interface AiFeedback {
  score: number;
  earned: number;
  max: number;
  wordCount: number;
  contentPoints: AiPoint[];
  communication: { earned: number; commentRu: string };
  feedbackRu: string;
  feedbackDe: string;
  corrections: Array<{ original: string; corrected: string; explanation: string }>;
}

const KEY_T1_PROGRESS = 'otto-schreiben-teil1-progress-v2';
const KEY_T1_DRAFTS = 'otto-schreiben-teil1-drafts-v2';
const KEY_T2_PROGRESS = 'otto-schreiben-teil2-progress-v2';
const KEY_T2_DRAFTS = 'otto-schreiben-teil2-drafts-v2';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be unavailable in some embedded browsers; training still works in-session.
  }
}

function canonical(value: string) {
  return value
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[„“”"']/g, '')
    .replace(/\b(und)\b/g, ' ')
    .replace(/[^a-z0-9@]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (/^0+\d+$/.test(token) ? String(Number(token)) : token))
    .join(' ');
}

function withoutUnits(value: string) {
  return value
    .split(' ')
    .filter((token) => !['uhr', 'euro', 'eur', 'jahr', 'jahre', 'paar'].includes(token))
    .join(' ')
    .trim();
}

function answerMatches(input: string, expected: string) {
  const a = canonical(input);
  const b = canonical(expected);
  if (!a || !b) return false;
  if (a === b) return true;
  if (withoutUnits(a) && withoutUnits(a) === withoutUnits(b)) return true;
  if (a.length >= 3 && (b.includes(a) || a.includes(b))) return true;
  return false;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WritingModule({ onBack, onComplete }: WritingModuleProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [showTips, setShowTips] = useState(false);

  const [teil1Index, setTeil1Index] = useState(() => {
    const data = readStorage<{ current?: number }>(KEY_T1_PROGRESS, {});
    return Math.min(Math.max(data.current ?? 0, 0), schreibenTeil1Tasks.length - 1);
  });
  const [teil1Scores, setTeil1Scores] = useState<ScoreMap>(() =>
    readStorage<{ scores?: ScoreMap }>(KEY_T1_PROGRESS, {}).scores ?? {}
  );
  const [formDrafts, setFormDrafts] = useState<FormDrafts>(() => readStorage<FormDrafts>(KEY_T1_DRAFTS, {}));
  const [formResult, setFormResult] = useState<Record<number, boolean> | null>(null);
  const [showTeil1Ru, setShowTeil1Ru] = useState(false);

  const [teil2Index, setTeil2Index] = useState(() => {
    const data = readStorage<{ current?: number }>(KEY_T2_PROGRESS, {});
    return Math.min(Math.max(data.current ?? 0, 0), schreibenTeil2Tasks.length - 1);
  });
  const [teil2Scores, setTeil2Scores] = useState<ScoreMap>(() =>
    readStorage<{ scores?: ScoreMap }>(KEY_T2_PROGRESS, {}).scores ?? {}
  );
  const [letterDrafts, setLetterDrafts] = useState<LetterDrafts>(() => readStorage<LetterDrafts>(KEY_T2_DRAFTS, {}));
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showTeil2Ru, setShowTeil2Ru] = useState(false);

  const teil1Completed = Object.keys(teil1Scores).length;
  const teil2Completed = Object.keys(teil2Scores).length;
  const teil1Perfect = Object.values(teil1Scores).filter((score) => score === 5).length;
  const teil2Average = useMemo(() => {
    const values = Object.values(teil2Scores);
    return values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : 0;
  }, [teil2Scores]);

  const openTeil1 = () => {
    setScreen('teil1');
    setFormResult(null);
    setShowTeil1Ru(false);
  };

  const openTeil2 = () => {
    setScreen('teil2');
    setAiFeedback(null);
    setAiError('');
    setShowTeil2Ru(false);
  };

  if (screen === 'teil1') {
    const task = schreibenTeil1Tasks[teil1Index];
    const editableRows = task.rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => Boolean(row.answer));
    const currentAnswers = formDrafts[task.id] ?? {};

    const updateAnswer = (rowIndex: number, value: string) => {
      const next = {
        ...formDrafts,
        [task.id]: { ...currentAnswers, [rowIndex]: value },
      };
      setFormDrafts(next);
      writeStorage(KEY_T1_DRAFTS, next);
      setFormResult(null);
    };

    const checkForm = () => {
      const result: Record<number, boolean> = {};
      for (const { row, index } of editableRows) {
        result[index] = answerMatches(currentAnswers[index] ?? '', row.answer ?? '');
      }
      setFormResult(result);
      const score = Object.values(result).filter(Boolean).length;
      const nextScores = { ...teil1Scores, [task.id]: score };
      setTeil1Scores(nextScores);
      writeStorage(KEY_T1_PROGRESS, { current: teil1Index, scores: nextScores });
    };

    const nextForm = () => {
      if (teil1Index < schreibenTeil1Tasks.length - 1) {
        const nextIndex = teil1Index + 1;
        setTeil1Index(nextIndex);
        setFormResult(null);
        writeStorage(KEY_T1_PROGRESS, { current: nextIndex, scores: teil1Scores });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const totalCorrect = Object.values(teil1Scores).reduce((sum, score) => sum + score, 0);
        onComplete(totalCorrect, schreibenTeil1Tasks.length * 5);
        setScreen('home');
      }
    };

    return (
      <SchreibenShell onBack={() => setScreen('home')} title="Schreiben · Teil 1" subtitle={`Задание ${teil1Index + 1} из ${schreibenTeil1Tasks.length}`} onTips={() => setShowTips(true)}>
        <Progress value={teil1Index + 1} total={schreibenTeil1Tasks.length} />

        <section className="rounded-[22px] border border-[#ddd7ca] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7628]">Schreiben · Teil 1</p>
              <h2 className="mt-1 text-xl font-bold text-[#10243f]">{task.title}</h2>
            </div>
            <button type="button" onClick={() => setShowTeil1Ru((v) => !v)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ddd7ca] bg-[#f8f6f1] text-[#10243f]" aria-label="Показать пояснение по-русски">
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-[#f3f1ec] p-4 text-[15px] leading-7 text-slate-800">
            <p>{task.scenario}</p>
          </div>
          <p className="mt-4 text-[15px] font-medium leading-6 text-[#10243f]">{task.instruction}</p>
          {showTeil1Ru && (
            <div className="mt-3 rounded-xl border border-[#e4d3a7] bg-[#fbf6e9] p-3 text-sm leading-6 text-slate-700">
              Прочитайте ситуацию и внесите в формуляр пять недостающих данных. Ответы берутся только из текста задания.
            </div>
          )}
        </section>

        <section className="mt-4 overflow-hidden rounded-[22px] border border-[#d7d1c5] bg-[#fffefa] shadow-sm">
          <div className="border-b border-[#d7d1c5] bg-[#ece9e2] px-4 py-3 text-sm font-bold text-[#10243f] sm:px-6">
            {task.title}
          </div>
          <div className="divide-y divide-[#e5e0d6]">
            {task.rows.map((row, rowIndex) => {
              const editable = Boolean(row.answer);
              const checked = formResult?.[rowIndex];
              return (
                <div key={`${row.label}-${rowIndex}`} className="grid grid-cols-[minmax(105px,0.8fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-3 sm:grid-cols-[220px_1fr] sm:px-6">
                  <label className="text-sm font-semibold text-slate-700">{row.label}:</label>
                  {editable ? (
                    <div>
                      <div className="relative">
                        <input
                          value={currentAnswers[rowIndex] ?? ''}
                          onChange={(event) => updateAnswer(rowIndex, event.target.value)}
                          disabled={Boolean(formResult)}
                          className={cn(
                            'min-h-11 w-full rounded-xl border bg-white px-3 py-2 pr-10 text-base text-slate-900 outline-none transition focus:ring-2',
                            formResult == null && 'border-slate-300 focus:border-[#c69b3c] focus:ring-[#c69b3c]/15',
                            checked === true && 'border-emerald-400 bg-emerald-50 focus:ring-emerald-100',
                            checked === false && 'border-rose-400 bg-rose-50 focus:ring-rose-100'
                          )}
                        />
                        {checked === true && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-600" />}
                        {checked === false && <XCircle className="absolute right-3 top-3 h-5 w-5 text-rose-600" />}
                      </div>
                      {checked === false && (
                        <p className="mt-1 text-xs text-rose-700">Правильно: <b>{row.answer}</b></p>
                      )}
                    </div>
                  ) : (
                    <div className="min-h-11 rounded-xl bg-[#f3f1ec] px-3 py-2 text-sm leading-6 text-slate-700">{row.value}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {formResult && (
          <div className="mt-4 rounded-2xl border border-[#d7d1c5] bg-white p-4">
            <p className="font-bold text-[#10243f]">Результат: {Object.values(formResult).filter(Boolean).length} из 5</p>
            <p className="mt-1 text-sm text-slate-600">Ошибочные поля показаны вместе с правильным ответом.</p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {!formResult ? (
            <button type="button" onClick={checkForm} disabled={editableRows.some(({ index }) => !(currentAnswers[index] ?? '').trim())} className="min-h-12 rounded-xl bg-[#10243f] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
              Проверить
            </button>
          ) : (
            <button type="button" onClick={nextForm} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10243f] px-6 py-3 font-semibold text-white">
              {teil1Index < schreibenTeil1Tasks.length - 1 ? 'Следующее задание' : 'Завершить Teil 1'}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {showTips && <TipsModal onClose={() => setShowTips(false)} />}
      </SchreibenShell>
    );
  }

  if (screen === 'teil2') {
    const task = schreibenTeil2Tasks[teil2Index];
    const text = letterDrafts[task.id] ?? '';
    const wordCount = countWords(text);

    const updateLetter = (value: string) => {
      const next = { ...letterDrafts, [task.id]: value };
      setLetterDrafts(next);
      writeStorage(KEY_T2_DRAFTS, next);
      setAiFeedback(null);
      setAiError('');
    };

    const checkLetter = async () => {
      if (!text.trim() || aiLoading) return;
      setAiLoading(true);
      setAiError('');
      setAiFeedback(null);
      try {
        const response = await fetch('/api/check-schreiben', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, situation: task.situation, points: task.points }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Не удалось проверить письмо.');
        const result = payload as AiFeedback;
        setAiFeedback(result);
        const nextScores = { ...teil2Scores, [task.id]: result.score };
        setTeil2Scores(nextScores);
        writeStorage(KEY_T2_PROGRESS, { current: teil2Index, scores: nextScores });
      } catch (error) {
        setAiError(error instanceof Error ? error.message : 'Не удалось проверить письмо.');
      } finally {
        setAiLoading(false);
      }
    };

    const nextLetter = () => {
      if (teil2Index < schreibenTeil2Tasks.length - 1) {
        const nextIndex = teil2Index + 1;
        setTeil2Index(nextIndex);
        setAiFeedback(null);
        setAiError('');
        writeStorage(KEY_T2_PROGRESS, { current: nextIndex, scores: teil2Scores });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const values = Object.values(teil2Scores);
        const average = values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : 0;
        onComplete(average, 100);
        setScreen('home');
      }
    };

    return (
      <SchreibenShell onBack={() => setScreen('home')} title="Schreiben · Teil 2" subtitle={`Задание ${teil2Index + 1} из ${schreibenTeil2Tasks.length}`} onTips={() => setShowTips(true)}>
        <Progress value={teil2Index + 1} total={schreibenTeil2Tasks.length} />

        <section className="rounded-[22px] border border-[#d4d0c8] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d4d0c8] bg-[#ecebea] px-4 py-3 sm:px-6">
            <div>
              <p className="text-sm font-bold text-[#10243f]">Schreiben · Teil 2</p>
              <p className="text-xs text-slate-500">{task.title}</p>
            </div>
            <button type="button" onClick={() => setShowTeil2Ru((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4d0c8] bg-white text-[#10243f]" aria-label="Показать пояснение по-русски">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-[16px] leading-7 text-slate-900">{task.situation}</p>
            <div className="mt-5 space-y-2 border-l-2 border-[#c69b3c] pl-4">
              {task.points.map((point) => <p key={point} className="text-[15px] leading-6 text-slate-800">– {point}</p>)}
            </div>
            <p className="mt-5 text-sm font-semibold text-[#10243f]">Schreiben Sie zu jedem Punkt ein bis zwei Sätze. Schreiben Sie auch eine Anrede und einen Gruß (circa 30 Wörter).</p>
            {showTeil2Ru && (
              <div className="mt-3 rounded-xl border border-[#e4d3a7] bg-[#fbf6e9] p-3 text-sm leading-6 text-slate-700">
                Напишите короткое письмо примерно на 30 слов. Раскройте все три пункта, добавьте обращение и прощание.
              </div>
            )}
          </div>
        </section>

        <section className="mt-4 rounded-[22px] border border-[#d4d0c8] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-[#10243f]">Ваш ответ</h3>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', wordCount >= 25 && wordCount <= 45 ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3f1ec] text-slate-600')}>{wordCount} слов</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => updateLetter(event.target.value)}
            disabled={aiLoading}
            placeholder="Schreiben Sie hier Ihren Text…"
            className="min-h-[210px] w-full resize-y rounded-2xl border border-slate-300 bg-[#fffefa] p-4 text-base leading-7 text-slate-900 outline-none transition focus:border-[#c69b3c] focus:ring-2 focus:ring-[#c69b3c]/15"
          />
          <p className="mt-2 text-xs text-slate-500">Ориентир экзамена — около 30 слов. Проверка учитывает прежде всего выполнение трёх пунктов и понятность.</p>
        </section>

        {aiError && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{aiError}</div>}

        {aiFeedback && <FeedbackCard feedback={aiFeedback} />}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {!aiFeedback ? (
            <button type="button" onClick={checkLetter} disabled={!text.trim() || aiLoading} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10243f] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Otto проверяет…</> : <><Sparkles className="h-4 w-4" /> Проверить письмо</>}
            </button>
          ) : (
            <button type="button" onClick={nextLetter} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#10243f] px-6 py-3 font-semibold text-white">
              {teil2Index < schreibenTeil2Tasks.length - 1 ? 'Следующее задание' : 'Завершить Teil 2'}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {showTips && <TipsModal onClose={() => setShowTips(false)} />}
      </SchreibenShell>
    );
  }

  return (
    <div className="animate-fade-in rounded-[28px] bg-[#f3f1ec] p-3 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <button type="button" onClick={onBack} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d2c6] bg-white text-[#10243f]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7628]">Goethe-Zertifikat A1</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#10243f]">SCHREIBEN</h1>
          <p className="mt-1 text-sm text-slate-600">Формуляры и короткие письма</p>
        </div>
        <button type="button" onClick={() => setShowTips(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d2c6] bg-white text-[#10243f]" aria-label="Подсказки">
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <ModuleCard
          number="1"
          title="Formulare"
          description="Прочитайте ситуацию и заполните 5 пропусков в формуляре. Проверка точная и мгновенная."
          icon={<FileText className="h-5 w-5" />}
          completed={teil1Completed}
          total={schreibenTeil1Tasks.length}
          extra={`${teil1Perfect} без ошибок`}
          onStart={openTeil1}
        />
        <ModuleCard
          number="2"
          title="Kurze Mitteilungen"
          description="Напишите короткое письмо примерно на 30 слов. Otto проверит содержание по критериям A1."
          icon={<PenLine className="h-5 w-5" />}
          completed={teil2Completed}
          total={schreibenTeil2Tasks.length}
          extra={teil2Completed ? `Средний результат ${teil2Average}%` : 'AI-проверка'}
          onStart={openTeil2}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-[#ddd7ca] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#10243f]"><BookOpenCheck className="h-4 w-4 text-[#c69b3c]" /> Как на экзамене</div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Teil 1 — заполнение формуляра. Teil 2 — короткое сообщение по трём обязательным пунктам.</p>
      </div>

      {showTips && <TipsModal onClose={() => setShowTips(false)} />}
    </div>
  );
}

function SchreibenShell({ onBack, title, subtitle, onTips, children }: { onBack: () => void; title: string; subtitle: string; onTips: () => void; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in rounded-[28px] bg-[#f3f1ec] p-3 sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <button type="button" onClick={onBack} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d2c6] bg-white text-[#10243f]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black text-[#10243f]">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <button type="button" onClick={onTips} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d8d2c6] bg-white text-[#10243f]" aria-label="Подсказки">
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>
      {children}
    </div>
  );
}

function Progress({ value, total }: { value: number; total: number }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-500"><span>Прогресс</span><span>{value} / {total}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-[#ded9cf]"><div className="h-full rounded-full bg-[#c69b3c] transition-all" style={{ width: `${Math.min(100, (value / total) * 100)}%` }} /></div>
    </div>
  );
}

function ModuleCard({ number, title, description, icon, completed, total, extra, onStart }: { number: string; title: string; description: string; icon: React.ReactNode; completed: number; total: number; extra: string; onStart: () => void }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section className="rounded-[22px] border border-[#ddd7ca] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10243f] text-white">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7628]">Teil {number}</p>
          <h2 className="mt-1 text-xl font-bold text-[#10243f]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f3f1ec] p-3"><p className="text-xs text-slate-500">Выполнено</p><p className="mt-1 text-lg font-black text-[#10243f]">{completed} / {total}</p></div>
        <div className="rounded-xl bg-[#f3f1ec] p-3"><p className="text-xs text-slate-500">Результат</p><p className="mt-1 text-sm font-bold text-[#10243f]">{extra}</p></div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e4dfd5]"><div className="h-full rounded-full bg-[#c69b3c]" style={{ width: `${percent}%` }} /></div>
      <button type="button" onClick={onStart} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10243f] px-5 py-3 font-semibold text-white">
        Тренироваться <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}

function FeedbackCard({ feedback }: { feedback: AiFeedback }) {
  return (
    <section className="mt-4 rounded-[22px] border border-[#d4d0c8] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-[#c69b3c] bg-[#fbf6e9] text-xl font-black text-[#10243f]">{feedback.score}%</div>
        <div>
          <h3 className="font-black text-[#10243f]">Результат Otto</h3>
          <p className="text-sm text-slate-600">{feedback.earned} / {feedback.max} баллов · {feedback.wordCount} слов</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {feedback.contentPoints.map((point, index) => (
          <div key={`${point.point}-${index}`} className="rounded-xl bg-[#f6f4ef] p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-[#10243f]">{index + 1}. {point.point}</p>
              <span className={cn('shrink-0 rounded-full px-2 py-1 text-xs font-bold', point.earned === 3 ? 'bg-emerald-100 text-emerald-700' : point.earned === 1.5 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-700')}>{point.earned} / 3</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{point.commentRu}</p>
          </div>
        ))}
        <div className="rounded-xl bg-[#f6f4ef] p-3">
          <div className="flex justify-between gap-3"><p className="text-sm font-semibold text-[#10243f]">Kommunikative Gestaltung</p><span className="text-xs font-bold text-[#9a7628]">{feedback.communication.earned} / 1</span></div>
          <p className="mt-1 text-sm text-slate-600">{feedback.communication.commentRu}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#e4d3a7] bg-[#fbf6e9] p-4">
        <p className="text-sm font-bold text-[#10243f]">Обратная связь</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{feedback.feedbackRu}</p>
        <p className="mt-2 text-sm font-medium leading-6 text-[#10243f]">{feedback.feedbackDe}</p>
      </div>

      {feedback.corrections.length > 0 && (
        <div className="mt-5">
          <h4 className="font-bold text-[#10243f]">Что исправить</h4>
          <div className="mt-3 space-y-3">
            {feedback.corrections.map((item, index) => (
              <div key={`${item.original}-${index}`} className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="text-rose-700"><b>Было:</b> {item.original}</p>
                <p className="mt-1 text-emerald-700"><b>Лучше:</b> {item.corrected}</p>
                <p className="mt-2 leading-6 text-slate-600">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function TipsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-[26px] bg-[#fffefa] p-5 shadow-2xl sm:rounded-[26px] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7628]">Otto</p><h3 className="text-xl font-black text-[#10243f]">Подсказки для Schreiben A1</h3></div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f1ec] text-[#10243f]"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
          <Tip n="1" text="Сначала проверьте все три пункта задания. Проще всего написать по одному короткому предложению на каждый пункт." />
          <Tip n="2" text="Не забудьте обращение и прощание: Hallo/Liebe… или Sehr geehrte Damen und Herren; затем Viele Grüße / Mit freundlichen Grüßen." />
          <Tip n="3" text="В обычном предложении глагол обычно стоит на втором месте: Ich möchte einen Tenniskurs besuchen." />
          <Tip n="4" text="В W-Frage вопросительное слово идёт первым: Wann beginnt der Kurs? Wie viel kostet der Kurs?" />
          <Tip n="5" text="Для времени пригодятся um + Uhrzeit, am + Wochentag, im + Monat: um 18 Uhr, am Montag, im September." />
          <Tip n="6" text="Пишите просто. На A1 понятное короткое предложение лучше, чем сложная конструкция с ошибками." />
        </div>
        <button type="button" onClick={onClose} className="mt-5 min-h-12 w-full rounded-xl bg-[#10243f] px-5 py-3 font-semibold text-white">Понятно</button>
      </div>
    </div>
  );
}

function Tip({ n, text }: { n: string; text: string }) {
  return <div className="flex gap-3 rounded-xl bg-[#f3f1ec] p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c69b3c] text-xs font-black text-white">{n}</span><p>{text}</p></div>;
}
