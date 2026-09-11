import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react';
import { readingTasks } from '@/data/reading';
import { listeningTasks } from '@/data/listening';
import type { MultipleChoiceQuestion, TrueFalseQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface MockExamProps {
  onBack: () => void;
}

interface ExamQuestion {
  id: string;
  module: 'lesen' | 'horen';
  taskTitle: string;
  text?: string;
  audioText?: string;
  question: MultipleChoiceQuestion | TrueFalseQuestion;
}

const EXAM_DURATION = 20 * 60;

function buildExamQuestions(): ExamQuestion[] {
  const result: ExamQuestion[] = [];

  for (const task of readingTasks) {
    for (const question of task.questions) {
      result.push({
        id: question.id,
        module: 'lesen',
        taskTitle: task.title,
        text: task.text,
        question,
      });
    }
  }

  for (const task of listeningTasks) {
    const question: MultipleChoiceQuestion | TrueFalseQuestion =
      task.type === 'multiple-choice'
        ? {
            id: task.id,
            type: 'multiple-choice',
            prompt: task.prompt,
            options: task.options,
            correctIndex: task.correctIndex,
          }
        : {
            id: task.id,
            type: 'true-false',
            prompt: task.prompt,
            correctAnswer: task.correctAnswer,
          };

    result.push({
      id: task.id,
      module: 'horen',
      taskTitle: task.title,
      audioText: task.audioText,
      question,
    });
  }

  return result;
}

export function MockExam({ onBack }: MockExamProps) {
  const questions = useMemo(buildExamQuestions, []);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | boolean | null)[]>(() =>
    Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [started, finished, timeLeft]);

  const handleAnswer = useCallback((index: number, value: number | boolean) => {
    setAnswers((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }, []);

  const start = () => {
    setAnswers(Array(questions.length).fill(null));
    setTimeLeft(EXAM_DURATION);
    setFinished(false);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="animate-fade-in">
        <Header onBack={onBack} />
        <div className="rounded-2xl bg-slate-900 p-7 text-center text-white shadow-xl sm:p-9">
          <Trophy className="mx-auto mb-4 h-11 w-11" />
          <h2 className="text-2xl font-bold">Модельный экзамен A1</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/75">
            Чтение и аудирование в одном ограниченном по времени тесте.
          </p>
          <div className="mt-5 flex justify-center gap-3 text-sm">
            <span className="rounded-full bg-white/10 px-4 py-2">{questions.length} заданий</span>
            <span className="rounded-full bg-white/10 px-4 py-2">20 минут</span>
          </div>
          <button
            type="button"
            onClick={start}
            className="mt-6 min-h-[48px] rounded-xl bg-white px-7 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            Начать экзамен
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = calculateScore(questions, answers);
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="animate-fade-in">
        <Header onBack={onBack} />
        <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <Trophy className="mx-auto h-12 w-12 text-slate-700" />
          <h2 className="mt-4 text-2xl font-bold text-slate-950">Результат</h2>
          <div className="mt-3 text-5xl font-black text-slate-950">{percent}%</div>
          <p className="mt-2 text-slate-600">{score} из {questions.length} правильных ответов</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={start}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Пройти заново
            </button>
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
            >
              К модулям
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answered = answers.filter((answer) => answer !== null).length;
  const lowTime = timeLeft < 60;

  return (
    <div className="animate-fade-in pb-8">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <Header onBack={onBack} compact />
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-bold',
              lowTime ? 'bg-rose-100 text-rose-700' : 'bg-slate-900 text-white'
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Отвечено: {answered} / {questions.length}</p>
      </div>

      <div className="space-y-5">
        {questions.map((item, index) => (
          <ExamQuestionCard
            key={`${item.module}-${item.id}`}
            item={item}
            index={index}
            selected={answers[index]}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      <div className="mt-7 flex justify-center">
        <button
          type="button"
          onClick={() => setFinished(true)}
          className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 font-semibold text-white"
        >
          <CheckCircle2 className="h-5 w-5" />
          Завершить экзамен
        </button>
      </div>
    </div>
  );
}

function Header({ onBack, compact = false }: { onBack: () => void; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', !compact && 'mb-6')}>
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white"
        aria-label="Назад"
      >
        <ArrowLeft className="h-5 w-5 text-slate-600" />
      </button>
      <div>
        <h1 className={cn('font-bold text-slate-950', compact ? 'text-base' : 'text-xl')}>Тестовый экзамен</h1>
        {!compact && <p className="text-sm text-slate-500">Lesen + Hören</p>}
      </div>
    </div>
  );
}

function ExamQuestionCard({
  item,
  index,
  selected,
  onAnswer,
}: {
  item: ExamQuestion;
  index: number;
  selected: number | boolean | null;
  onAnswer: (index: number, value: number | boolean) => void;
}) {
  const [showText, setShowText] = useState(false);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if (!item.audioText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.audioText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setPlaying(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {item.module === 'lesen' ? (
          <BookOpen className="h-4 w-4 text-teal-700" />
        ) : (
          <Headphones className="h-4 w-4 text-sky-700" />
        )}
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {item.module === 'lesen' ? 'Lesen' : 'Hören'} · {item.taskTitle}
        </span>
      </div>

      {item.text && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowText((value) => !value)}
            className="text-sm font-semibold text-teal-700"
          >
            {showText ? 'Скрыть текст' : 'Показать текст'}
          </button>
          {showText && (
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
              {item.text}
            </div>
          )}
        </div>
      )}

      {item.audioText && (
        <button
          type="button"
          onClick={playing ? stop : play}
          className="mb-4 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <Volume2 className="h-4 w-4" />
          {playing ? 'Остановить' : 'Прослушать'}
        </button>
      )}

      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
          {index + 1}
        </span>
        <p className="pt-1 font-medium text-slate-900">{item.question.prompt}</p>
      </div>

      {item.question.type === 'multiple-choice' ? (
        <div className="ml-0 space-y-2 sm:ml-11">
          {item.question.options.map((option, optionIndex) => (
            <button
              key={option}
              type="button"
              onClick={() => onAnswer(index, optionIndex)}
              className={cn(
                'flex min-h-[46px] w-full items-center gap-3 rounded-xl border-2 px-4 py-2 text-left',
                selected === optionIndex
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <span className="font-bold text-slate-500">{String.fromCharCode(65 + optionIndex)}</span>
              <span className="text-slate-800">{option}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="ml-0 grid grid-cols-2 gap-3 sm:ml-11">
          {[
            { value: true, label: 'Richtig' },
            { value: false, label: 'Falsch' },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => onAnswer(index, option.value)}
              className={cn(
                'min-h-[46px] rounded-xl border-2 px-4 py-2 font-medium',
                selected === option.value
                  ? 'border-teal-500 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function calculateScore(questions: ExamQuestion[], answers: (number | boolean | null)[]) {
  return questions.reduce((score, item, index) => {
    const answer = answers[index];
    if (answer === null) return score;
    if (item.question.type === 'multiple-choice') {
      return score + (answer === item.question.correctIndex ? 1 : 0);
    }
    return score + (answer === item.question.correctAnswer ? 1 : 0);
  }, 0);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}
