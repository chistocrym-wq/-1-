import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Lightbulb,
  Mic,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react';
import {
  speakingTeil1,
  speakingTeil2Cards,
  speakingTeil3Cards,
  type SpeakingPart,
} from '@/data/speaking';
import { freeSpeakingTopics } from '@/data/speakingFree';
import { SpeakingCardIllustration } from '@/components/sprechen/SpeakingCardIllustration';
import { cn } from '@/lib/utils';

interface SpeakingModuleProps {
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

type Screen = 'home' | 'teil1' | 'teil2' | 'teil3' | 'free';

export function SpeakingModule({ onBack, onComplete }: SpeakingModuleProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [teil2Index, setTeil2Index] = useState(0);
  const [teil3Index, setTeil3Index] = useState(0);
  const [freeIndex, setFreeIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [practiced, setPracticed] = useState(false);

  const resetViewState = () => {
    setShowSample(false);
    setShowGuide(false);
    setPracticed(false);
  };

  const openPart = (part: SpeakingPart) => {
    resetViewState();
    setScreen(`teil${part}` as Screen);
  };

  const openFree = () => {
    resetViewState();
    setScreen('free');
  };

  const backToHome = () => {
    resetViewState();
    setScreen('home');
  };

  if (screen === 'home') {
    return (
      <div className="animate-fade-in">
        <Header onBack={onBack} subtitle="Устная часть · экзамен + свободная речь" />

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[17px] leading-7 text-slate-700">
            Три экзаменационные части Sprechen сохранены. Дополнительно вернули отдельную тренировку свободного рассказа:
            можно выбрать тему, собрать ответ по опорам, записать себя и отправить запись Otto на AI-проверку.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PartCard badge="1" title="Sich vorstellen" description="Представьтесь по опорным словам и потренируйте имя и номер." meta="Экзамен · Teil 1" onClick={() => openPart(1)} />
          <PartCard badge="2" title="Informationen" description="Получите тему и слово. Задайте партнёру простой вопрос." meta={`${speakingTeil2Cards.length} карточек`} onClick={() => openPart(2)} />
          <PartCard badge="3" title="Bitten" description="Посмотрите на картинку, сформулируйте просьбу и реакцию." meta={`${speakingTeil3Cards.length} карточек`} onClick={() => openPart(3)} />
          <PartCard badge="+" title="Freies Sprechen" description="Составьте короткий рассказ по теме и расскажите его своими словами." meta={`${freeSpeakingTopics.length} тем · AI-проверка`} onClick={openFree} accent />
        </div>
      </div>
    );
  }

  if (screen === 'teil1') {
    return (
      <div className="animate-fade-in">
        <Header onBack={backToHome} subtitle="Teil 1 · Sich vorstellen" />
        <InstructionBox german={speakingTeil1.instruction} russian={speakingTeil1.instructionRu} />

        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <ExamCardHeader label="Sprechen Teil 1" />
          <div className="divide-y divide-slate-200 px-6 py-2 text-center">
            {speakingTeil1.keywords.map((keyword) => (
              <div key={keyword} className="py-3 text-3xl font-bold tracking-tight text-slate-900">{keyword}</div>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-semibold text-slate-900">После представления экзаменатор может попросить:</h3>
          <div className="space-y-2">
            {speakingTeil1.followUps.map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-[16px] text-slate-700">{item}</div>
            ))}
          </div>
        </div>

        <VoiceRecorder key="teil1" evaluation={{ mode: 'teil1', expectedPoints: speakingTeil1.checkPoints }} onPracticed={() => setPracticed(true)} />

        <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Пример короткого ответа">
          <p>{speakingTeil1.sampleAnswer}</p>
        </SampleBox>

        <BottomActions disabled={!practiced} onNext={() => { onComplete(1, 1); backToHome(); }} nextLabel="Завершить Teil 1" />
      </div>
    );
  }

  if (screen === 'teil2') {
    const card = speakingTeil2Cards[teil2Index];
    return (
      <div className="animate-fade-in">
        <Header onBack={backToHome} subtitle={`Teil 2 · Карточка ${teil2Index + 1} из ${speakingTeil2Cards.length}`} />
        <InstructionBox german="Bitten Sie um Informationen. Stellen Sie eine Frage zum Thema und zum Wort auf der Karte." russian="Задайте партнёру один простой вопрос. Вопрос должен соответствовать теме и слову на карточке." />

        <div className="mx-auto mb-5 max-w-xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow-sm">
          <ExamCardHeader label="Sprechen Teil 2" />
          <div className="border-b border-slate-300 bg-slate-100 px-5 py-2 text-center text-sm font-semibold text-slate-700">Thema: {card.theme}</div>
          <div className="flex min-h-[190px] items-center justify-center px-6 py-10 text-center">
            <div className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{card.keyword}</div>
          </div>
        </div>

        <VoiceRecorder key={card.id} evaluation={{ mode: 'teil2', theme: card.theme, keyword: card.keyword, sampleQuestion: card.sampleQuestion }} onPracticed={() => setPracticed(true)} />

        <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Один из возможных вариантов">
          <p className="font-medium text-slate-900">Frage: {card.sampleQuestion}</p>
          <p className="mt-2 text-slate-600">Antwort: {card.sampleAnswer}</p>
        </SampleBox>

        <BottomActions
          disabled={!practiced}
          onNext={() => { setTeil2Index((value) => (value + 1) % speakingTeil2Cards.length); resetViewState(); }}
          onShuffle={() => { setTeil2Index((value) => nextRandomIndex(value, speakingTeil2Cards.length)); resetViewState(); }}
          nextLabel="Следующая карточка"
        />
      </div>
    );
  }

  if (screen === 'teil3') {
    const card = speakingTeil3Cards[teil3Index];
    return (
      <div className="animate-fade-in">
        <Header onBack={backToHome} subtitle={`Teil 3 · Карточка ${teil3Index + 1} из ${speakingTeil3Cards.length}`} />
        <InstructionBox german="Formulieren Sie eine Bitte oder Frage zur Karte. Reagieren Sie auch auf eine Bitte Ihres Partners." russian="По картинке сформулируйте понятную вежливую просьбу или вопрос. Затем потренируйте короткую реакцию на такую просьбу." />

        <div className="mx-auto mb-5 max-w-xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow-sm">
          <ExamCardHeader label="Sprechen Teil 3" />
          <div className="p-5 sm:p-7"><SpeakingCardIllustration visual={card.visual} alt={card.alt} /></div>
        </div>

        <VoiceRecorder key={card.id} evaluation={{ mode: 'teil3', object: card.alt, sampleRequest: card.sampleRequest }} onPracticed={() => setPracticed(true)} />

        <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Пример просьбы и реакции">
          <p className="font-medium text-slate-900">Bitte: {card.sampleRequest}</p>
          <p className="mt-2 text-slate-600">Reaktion: {card.sampleReaction}</p>
        </SampleBox>

        <BottomActions
          disabled={!practiced}
          onNext={() => { setTeil3Index((value) => (value + 1) % speakingTeil3Cards.length); resetViewState(); }}
          onShuffle={() => { setTeil3Index((value) => nextRandomIndex(value, speakingTeil3Cards.length)); resetViewState(); }}
          nextLabel="Следующая карточка"
        />
      </div>
    );
  }

  const topic = freeSpeakingTopics[freeIndex];
  return (
    <div className="animate-fade-in">
      <Header onBack={backToHome} subtitle={`Freies Sprechen · Тема ${freeIndex + 1} из ${freeSpeakingTopics.length}`} />
      <InstructionBox german="Sprechen Sie frei über das Thema. Nutzen Sie die Fragen nur als Hilfe." russian="Составьте короткий связный рассказ и расскажите его своими словами. Опорные вопросы — подсказка, а не текст для чтения." />

      <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-amber-100 px-5 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Freies Sprechen</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">{topic.title}</h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-900">{topic.titleRu}</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="space-y-3">
            {topic.questions.map((question, index) => (
              <div key={question} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-[16px] leading-6 text-slate-800">
                <span className="font-black text-amber-700">{index + 1}.</span>
                <span>{question}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setShowGuide((value) => !value)} className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
            <Lightbulb className="h-4 w-4" />
            {showGuide ? 'Скрыть конструктор рассказа' : 'Открыть конструктор рассказа'}
          </button>
          {showGuide && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">Начните фразы и подставьте свои данные:</p>
              <div className="space-y-2">
                {topic.guide.map((line) => <p key={line} className="border-b border-dashed border-slate-200 pb-2 text-[16px] leading-7 text-slate-700">{line}</p>)}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Не обязательно использовать все фразы. Главное — связно раскрыть три вопроса темы.</p>
            </div>
          )}
        </div>
      </div>

      <VoiceRecorder
        key={topic.id}
        evaluation={{ mode: 'free', title: topic.title, expectedPoints: topic.questions }}
        onPracticed={() => setPracticed(true)}
        hint="Говорите примерно 45–120 секунд. Можно сначала открыть конструктор, затем закрыть его и рассказать своими словами."
      />

      <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Пример связного рассказа A1">
        <p>{topic.sample}</p>
      </SampleBox>

      <BottomActions
        disabled={!practiced}
        onNext={() => { setFreeIndex((value) => (value + 1) % freeSpeakingTopics.length); resetViewState(); }}
        onShuffle={() => { setFreeIndex((value) => nextRandomIndex(value, freeSpeakingTopics.length)); resetViewState(); }}
        nextLabel="Следующая тема"
      />
    </div>
  );
}

function Header({ onBack, subtitle }: { onBack: () => void; subtitle: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button type="button" onClick={onBack} aria-label="Назад" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50">
        <ArrowLeft className="h-5 w-5 text-slate-600" />
      </button>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-slate-950">Sprechen</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PartCard({ badge, title, description, meta, onClick, accent = false }: { badge: string; title: string; description: string; meta: string; onClick: () => void; accent?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn('group min-h-[220px] rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', accent ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-slate-300')}>
      <div className="mb-5 flex items-center justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold', accent ? 'bg-amber-100 text-amber-900' : 'bg-slate-900 text-white')}>{badge}</span>
        <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
      </div>
      <div className="text-lg font-bold text-slate-950">{badge === '+' ? title : `Teil ${badge} · ${title}`}</div>
      <p className="mt-2 text-[15px] leading-6 text-slate-600">{description}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{meta}</p>
    </button>
  );
}

function InstructionBox({ german, russian }: { german: string; russian: string }) {
  return <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="font-medium leading-7 text-slate-900">{german}</p><p className="mt-2 text-sm leading-6 text-slate-500">{russian}</p></div>;
}

function ExamCardHeader({ label }: { label: string }) {
  return <div className="flex items-center justify-between bg-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"><span>Start Deutsch 1 · Training</span><span>{label}</span></div>;
}

function SampleBox({ show, onToggle, title, children }: { show: boolean; onToggle: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
      <button type="button" onClick={onToggle} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"><Eye className="h-4 w-4" />{show ? 'Скрыть пример' : 'Показать пример после своего ответа'}</button>
      {show && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-[16px] leading-7 text-slate-700"><div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">{title}</div>{children}</div>}
    </div>
  );
}

function BottomActions({ disabled, onNext, onShuffle, nextLabel }: { disabled: boolean; onNext: () => void; onShuffle?: () => void; nextLabel: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
      {onShuffle && <button type="button" onClick={onShuffle} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Случайная тема</button>}
      <button type="button" onClick={onNext} disabled={disabled} className={cn('inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition', disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800')}>{nextLabel}<ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}

type EvaluationPayload =
  | { mode: 'teil1'; expectedPoints: string[] }
  | { mode: 'teil2'; theme: string; keyword: string; sampleQuestion: string }
  | { mode: 'teil3'; object: string; sampleRequest: string }
  | { mode: 'free'; title: string; expectedPoints: string[] };

interface EvaluationResult {
  score: number;
  transcript: string;
  feedbackRu: string;
  feedbackDe?: string;
  missing?: string[];
}

function VoiceRecorder({ evaluation, onPracticed, hint }: { evaluation: EvaluationPayload; onPracticed: () => void; hint?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);
  const stopTracks = useCallback(() => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }, []);

  useEffect(() => () => { clearTimer(); stopTracks(); if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current); }, [clearTimer, stopTracks]);

  const resetRecording = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null); setAudioBlob(null); setElapsed(0); setResult(null); setError(null);
  }, []);

  const startRecording = useCallback(async () => {
    resetRecording();
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Браузер не поддерживает запись через микрофон.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; chunksRef.current = [];
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url; setAudioBlob(blob); setAudioUrl(url); setIsRecording(false); clearTimer(); stopTracks(); onPracticed();
      };
      recorder.start(250); setElapsed(0); setIsRecording(true); setError(null);
      timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
    } catch (recordingError) {
      stopTracks();
      setError(recordingError instanceof Error ? recordingError.message : 'Не удалось включить микрофон.');
    }
  }, [clearTimer, onPracticed, resetRecording, stopTracks]);

  const stopRecording = useCallback(() => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); }, []);

  const checkWithOtto = useCallback(async () => {
    if (!audioBlob) return;
    setChecking(true); setError(null); setResult(null);
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await fetch('/api/check-sprechen', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evaluation, audioBase64, mimeType: audioBlob.type || 'audio/webm' }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || 'Проверка Otto сейчас недоступна. Запись можно прослушать и продолжить тренировку.');
      setResult(payload as EvaluationResult);
    } catch (checkingError) {
      setError(checkingError instanceof Error ? checkingError.message : 'Не удалось проверить запись.');
    } finally { setChecking(false); }
  }, [audioBlob, evaluation]);

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="font-semibold text-slate-950">Ответьте вслух</h3><p className="mt-1 text-sm leading-6 text-slate-500">{hint || 'Нажмите микрофон, скажите ответ и остановите запись. Не нужно говорить медленно или по слогам.'}</p></div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold tabular-nums text-slate-700">{formatTime(elapsed)}</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={isRecording ? stopRecording : startRecording} aria-label={isRecording ? 'Остановить запись' : 'Начать запись'} className={cn('flex h-16 w-16 items-center justify-center rounded-full transition active:scale-95', isRecording ? 'animate-pulse bg-red-600 text-white' : 'border-2 border-slate-300 bg-white text-slate-900 hover:border-slate-500')}>{isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-7 w-7" />}</button>
        {audioUrl && !isRecording && <><audio src={audioUrl} controls className="h-11 min-w-[210px] max-w-full flex-1" /><button type="button" onClick={resetRecording} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Перезаписать</button></>}
      </div>

      {audioBlob && !isRecording && <div className="mt-4 border-t border-slate-100 pt-4"><button type="button" onClick={checkWithOtto} disabled={checking} className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60"><Sparkles className="h-4 w-4" />{checking ? 'Otto слушает…' : 'Проверить с Otto'}</button><p className="mt-2 text-xs leading-5 text-slate-400">Проверяется выполнение задания и понятность ответа A1. Точная фонетическая оценка произношения не заявляется.</p></div>}

      {result && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" />{result.score} / 100</div><p className="mt-2 text-sm leading-6 text-slate-700">{result.feedbackRu}</p>{result.feedbackDe && <p className="mt-2 text-sm leading-6 text-slate-600">{result.feedbackDe}</p>}{result.transcript && <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-slate-600"><span className="font-semibold">Распознано:</span> {result.transcript}</div>}{result.missing && result.missing.length > 0 && <p className="mt-2 text-sm text-slate-600">Не прозвучало: {result.missing.join(', ')}</p>}</div>}
      {error && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{error}</div>}
      {!audioBlob && !isRecording && <div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><Volume2 className="h-4 w-4" />Ваша запись останется только в текущем окне до отправки на проверку.</div>}
    </div>
  );
}

function formatTime(seconds: number) { const minutes = Math.floor(seconds / 60); const rest = seconds % 60; return `${minutes}:${rest.toString().padStart(2, '0')}`; }
function nextRandomIndex(current: number, total: number) { if (total <= 1) return 0; let next = current; while (next === current) next = Math.floor(Math.random() * total); return next; }
function blobToBase64(blob: Blob): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Не удалось подготовить аудио.')); reader.onload = () => { const value = String(reader.result || ''); const comma = value.indexOf(','); resolve(comma >= 0 ? value.slice(comma + 1) : value); }; reader.readAsDataURL(blob); }); }
