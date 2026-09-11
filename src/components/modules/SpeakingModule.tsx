import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lightbulb, RefreshCw } from 'lucide-react';
import {
  speakingTeil1,
  speakingTeil2Cards,
  speakingTeil3Cards,
  type SpeakingPart,
} from '@/data/speaking';
import { freeSpeakingTopics } from '@/data/speakingFree';
import { SpeakingCardIllustration } from '@/components/sprechen/SpeakingCardIllustration';
import { VoiceRecorder } from '@/components/sprechen/VoiceRecorder';
import { cn } from '@/lib/utils';

interface SpeakingModuleProps {
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

type Screen = 'home' | 'teil1' | 'teil2' | 'teil3' | 'free';

const KEYWORD_TRANSLATIONS: Record<string, string> = {
  'Name?': 'Имя',
  'Alter?': 'Возраст',
  'Land?': 'Страна',
  'Wohnort?': 'Место жительства',
  'Sprachen?': 'Языки',
  'Beruf?': 'Профессия',
  'Hobby?': 'Хобби',
};

const FOLLOW_UP_TRANSLATIONS: Record<string, string> = {
  'Können Sie bitte Ihren Namen buchstabieren?': 'Можете, пожалуйста, назвать ваше имя по буквам?',
  'Wie ist bitte Ihre Telefonnummer?': 'Какой у вас номер телефона?',
  'Wie ist Ihre Hausnummer?': 'Какой у вас номер дома?',
};

export function SpeakingModule({ onBack, onComplete }: SpeakingModuleProps) {
  const [screen, setScreen] = useState<Screen>('home');
  const [teil2Index, setTeil2Index] = useState(0);
  const [teil3Index, setTeil3Index] = useState(0);
  const [freeIndex, setFreeIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showHeaderTranslation, setShowHeaderTranslation] = useState(false);
  const [showExaminerTip, setShowExaminerTip] = useState(false);
  const [practiced, setPracticed] = useState(false);

  const resetViewState = () => {
    setShowSample(false);
    setShowGuide(false);
    setShowHeaderTranslation(false);
    setShowExaminerTip(false);
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
        <Header
          onBack={onBack}
          subtitle="Sprechen A1"
          translation="Говорение"
          translationOpen={showHeaderTranslation}
          onToggleTranslation={() => setShowHeaderTranslation((value) => !value)}
        />

        <div className="mx-auto mb-6 max-w-2xl px-2 text-center">
          <p className="text-sm leading-6 text-slate-600 sm:text-[15px]">
            Здесь вы тренируете устную часть A1: представление себя, простые вопросы по карточкам и вежливые просьбы.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PartCard badge="T1" title="Sich vorstellen" description="Представьтесь по опорным словам и потренируйте имя и номер." onClick={() => openPart(1)} />
          <PartCard badge="T2" title="Informationen" description="Получите тему и слово. Задайте партнёру простой вопрос." meta={`${speakingTeil2Cards.length} карточек`} onClick={() => openPart(2)} />
          <PartCard badge="T3" title="Bitten" description="Посмотрите на картинку, сформулируйте просьбу и реакцию." meta={`${speakingTeil3Cards.length} карточек`} onClick={() => openPart(3)} />
          <PartCard badge="+" title="Freies Sprechen" description="Составьте короткий рассказ по теме и расскажите его своими словами." meta={`${freeSpeakingTopics.length} тем`} onClick={openFree} accent />
        </div>
      </div>
    );
  }

  if (screen === 'teil1') {
    return (
      <div className="animate-fade-in">
        <Header
          onBack={backToHome}
          subtitle="T1 · Sich vorstellen"
          translation="T1 · Представиться"
          translationOpen={showHeaderTranslation}
          onToggleTranslation={() => setShowHeaderTranslation((value) => !value)}
          onTip={() => setShowExaminerTip((value) => !value)}
          tipOpen={showExaminerTip}
        />

        <InstructionBox german={speakingTeil1.instruction} russian={speakingTeil1.instructionRu} showTranslation={showHeaderTranslation} />
        {showExaminerTip && <ExaminerTipBox items={speakingTeil1.followUps} />}

        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="divide-y divide-slate-200 px-4 py-2 sm:px-6">
            {speakingTeil1.keywords.map((keyword) => (
              <div key={keyword} className="flex min-h-[64px] items-center justify-center py-3 text-center">
                <HoverTranslation
                  text={keyword}
                  translation={KEYWORD_TRANSLATIONS[keyword] ?? keyword}
                  className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                />
              </div>
            ))}
          </div>
        </div>

        <VoiceRecorder key="teil1" evaluation={{ mode: 'teil1', expectedPoints: speakingTeil1.checkPoints }} onPracticed={() => setPracticed(true)} />
        <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Пример короткого ответа"><p>{speakingTeil1.sampleAnswer}</p></SampleBox>
        <BottomActions disabled={!practiced} onNext={() => { onComplete(1, 1); backToHome(); }} nextLabel="Завершить T1" />
      </div>
    );
  }

  if (screen === 'teil2') {
    const card = speakingTeil2Cards[teil2Index];
    return (
      <div className="animate-fade-in">
        <Header
          onBack={backToHome}
          subtitle={`T2 · Карточка ${teil2Index + 1} из ${speakingTeil2Cards.length}`}
          translation="T2 · Получение информации"
          translationOpen={showHeaderTranslation}
          onToggleTranslation={() => setShowHeaderTranslation((value) => !value)}
        />
        <InstructionBox
          german="Bitten Sie um Informationen. Stellen Sie eine Frage zum Thema und zum Wort auf der Karte."
          russian="Задайте партнёру один простой вопрос. Вопрос должен соответствовать теме и слову на карточке."
          showTranslation={showHeaderTranslation}
        />

        <div className="mx-auto mb-5 max-w-xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow-sm">
          <ExamCardHeader label="T2" />
          <div className="border-b border-slate-300 bg-slate-100 px-5 py-2 text-center text-sm font-semibold text-slate-700">
            Thema:{' '}<HoverTranslation text={card.theme} translation={card.themeRu} className="font-semibold text-slate-800" />
          </div>
          <div className="flex min-h-[190px] items-center justify-center px-6 py-10 text-center">
            <HoverTranslation text={card.keyword} translation={card.keywordRu} className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl" />
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
          shuffleLabel="Случайная карточка"
        />
      </div>
    );
  }

  if (screen === 'teil3') {
    const card = speakingTeil3Cards[teil3Index];
    return (
      <div className="animate-fade-in">
        <Header
          onBack={backToHome}
          subtitle={`T3 · Карточка ${teil3Index + 1} из ${speakingTeil3Cards.length}`}
          translation="T3 · Просьбы"
          translationOpen={showHeaderTranslation}
          onToggleTranslation={() => setShowHeaderTranslation((value) => !value)}
        />
        <InstructionBox
          german="Formulieren Sie eine Bitte oder Frage zur Karte. Reagieren Sie auch auf eine Bitte Ihres Partners."
          russian="По картинке сформулируйте понятную вежливую просьбу или вопрос. Затем потренируйте короткую реакцию на такую просьбу."
          showTranslation={showHeaderTranslation}
        />

        <div className="mx-auto mb-5 max-w-xl overflow-hidden rounded-2xl border border-slate-400 bg-white shadow-sm">
          <ExamCardHeader label="T3" />
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
          shuffleLabel="Случайная карточка"
        />
      </div>
    );
  }

  const topic = freeSpeakingTopics[freeIndex];
  return (
    <div className="animate-fade-in">
      <Header
        onBack={backToHome}
        subtitle={`Freies Sprechen · Тема ${freeIndex + 1} из ${freeSpeakingTopics.length}`}
        translation="Свободная речь"
        translationOpen={showHeaderTranslation}
        onToggleTranslation={() => setShowHeaderTranslation((value) => !value)}
      />
      <InstructionBox
        german="Sprechen Sie frei über das Thema. Nutzen Sie die Fragen nur als Hilfe."
        russian="Составьте короткий связный рассказ и расскажите его своими словами. Опорные вопросы — подсказка, а не текст для чтения."
        showTranslation={showHeaderTranslation}
      />

      <div className="mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 bg-amber-100 px-5 py-3">
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
                <span className="font-black text-amber-700">{index + 1}.</span><span>{question}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setShowGuide((value) => !value)} className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
            <Lightbulb className="h-4 w-4" />{showGuide ? 'Скрыть конструктор рассказа' : 'Открыть конструктор рассказа'}
          </button>
          {showGuide && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">Начните фразы и подставьте свои данные:</p>
              <div className="space-y-2">{topic.guide.map((line) => <p key={line} className="border-b border-dashed border-slate-200 pb-2 text-[16px] leading-7 text-slate-700">{line}</p>)}</div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Не обязательно использовать все фразы. Главное — связно раскрыть три вопроса темы.</p>
            </div>
          )}
        </div>
      </div>

      <VoiceRecorder key={topic.id} evaluation={{ mode: 'free', title: topic.title, expectedPoints: topic.questions }} onPracticed={() => setPracticed(true)} hint="Говорите примерно 45–120 секунд. Можно сначала открыть конструктор, затем закрыть его и рассказать своими словами." />
      <SampleBox show={showSample} onToggle={() => setShowSample((value) => !value)} title="Пример связного рассказа A1"><p>{topic.sample}</p></SampleBox>
      <BottomActions
        disabled={!practiced}
        onNext={() => { setFreeIndex((value) => (value + 1) % freeSpeakingTopics.length); resetViewState(); }}
        onShuffle={() => { setFreeIndex((value) => nextRandomIndex(value, freeSpeakingTopics.length)); resetViewState(); }}
        nextLabel="Следующая тема"
      />
    </div>
  );
}

function Header({
  onBack,
  subtitle,
  translation,
  translationOpen,
  onToggleTranslation,
  onTip,
  tipOpen = false,
}: {
  onBack: () => void;
  subtitle: string;
  translation: string;
  translationOpen: boolean;
  onToggleTranslation: () => void;
  onTip?: () => void;
  tipOpen?: boolean;
}) {
  return (
    <div className="mb-5">
      <div className="relative flex min-h-[68px] items-start justify-center">
        <button type="button" onClick={onBack} aria-label="Назад" className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"><ArrowLeft className="h-5 w-5 text-slate-600" /></button>
        <div className="max-w-[68%] text-center sm:max-w-[74%]">
          <h2 className="text-2xl font-bold text-slate-950">Sprechen</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
          {translationOpen && <p className="mt-2 text-sm font-semibold text-amber-800">{translation}</p>}
        </div>
        <div className="absolute right-0 top-0 flex items-center gap-2">
          {onTip && (
            <button type="button" onClick={onTip} aria-label="Подсказка экзаменатора" title="Что может попросить экзаменатор" className={cn('flex h-11 w-11 items-center justify-center rounded-xl border transition', tipOpen ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700')}><Lightbulb className="h-5 w-5" /></button>
          )}
          <button type="button" onClick={onToggleTranslation} aria-label={translationOpen ? 'Скрыть перевод' : 'Перевод'} title={translationOpen ? 'Скрыть перевод' : 'Перевод'} className={cn('flex h-11 w-11 items-center justify-center rounded-xl border transition', translationOpen ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700')}>
            {translationOpen ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function PartCard({ badge, title, description, meta, onClick, accent = false }: { badge: string; title: string; description: string; meta?: string; onClick: () => void; accent?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn('group min-h-[210px] rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', accent ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-slate-300')}>
      <div className="mb-5 flex items-center justify-between">
        <span className={cn('flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-bold', accent ? 'bg-amber-100 text-amber-900' : 'bg-slate-900 text-white')}>{badge}</span>
        <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
      </div>
      <div className="text-lg font-bold text-slate-950">{title}</div>
      <p className="mt-2 text-[15px] leading-6 text-slate-600">{description}</p>
      {meta && <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{meta}</p>}
    </button>
  );
}

function InstructionBox({ german, russian, showTranslation }: { german: string; russian: string; showTranslation: boolean }) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
      <p className="font-medium leading-7 text-slate-900">{german}</p>
      {showTranslation && <p className="mt-3 border-t border-slate-200 pt-3 text-sm font-medium leading-6 text-amber-900">{russian}</p>}
    </div>
  );
}

function ExaminerTipBox({ items }: { items: string[] }) {
  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-center gap-2 text-center"><Lightbulb className="h-4 w-4 text-amber-700" /><h3 className="text-sm font-bold text-amber-900">После представления экзаменатор может попросить</h3></div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-amber-100 bg-white p-3 text-center">
            <HoverTranslation text={item} translation={FOLLOW_UP_TRANSLATIONS[item] ?? item} className="text-[15px] font-medium leading-6 text-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HoverTranslation({ text, translation, className }: { text: string; translation: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex cursor-help select-none items-center justify-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}
      tabIndex={0}
      role="button"
      aria-label={`${text}. Перевод: ${translation}`}
    >
      <span className={className}>{text}</span>
      {open && <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[230px] -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-semibold leading-5 text-amber-950 shadow-lg">{translation}</span>}
    </span>
  );
}

function ExamCardHeader({ label }: { label: string }) {
  return <div className="bg-slate-100 px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-600">{label}</div>;
}

function SampleBox({ show, onToggle, title, children }: { show: boolean; onToggle: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
      <button type="button" onClick={onToggle} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950"><Eye className="h-4 w-4" />{show ? 'Скрыть пример' : 'Показать пример после своего ответа'}</button>
      {show && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-[16px] leading-7 text-slate-700"><div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">{title}</div>{children}</div>}
    </div>
  );
}

function BottomActions({ disabled, onNext, onShuffle, nextLabel, shuffleLabel = 'Случайная тема' }: { disabled: boolean; onNext: () => void; onShuffle?: () => void; nextLabel: string; shuffleLabel?: string }) {
  return (
    <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
      {onShuffle && <button type="button" onClick={onShuffle} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />{shuffleLabel}</button>}
      <button type="button" onClick={onNext} disabled={disabled} className={cn('inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition', disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800')}>{nextLabel}<ArrowRight className="h-4 w-4" /></button>
    </div>
  );
}

function nextRandomIndex(current: number, total: number) {
  if (total <= 1) return 0;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * total);
  return next;
}
