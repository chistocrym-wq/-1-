import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mic, RefreshCw, Sparkles, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SpeakingEvaluation =
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

interface VoiceRecorderProps {
  evaluation: SpeakingEvaluation;
  onPracticed: () => void;
  hint?: string;
}

const MAX_CLIENT_AUDIO_BYTES = 2.8 * 1024 * 1024;

export function VoiceRecorder({ evaluation, onPracticed, hint }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/check-sprechen', { method: 'GET' })
      .then((response) => response.json())
      .then((payload) => { if (active) setAiAvailable(Boolean(payload?.aiConfigured)); })
      .catch(() => { if (active) setAiAvailable(null); });

    return () => {
      active = false;
      clearTimer();
      stopTracks();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, [clearTimer, stopTracks]);

  const resetRecording = useCallback(() => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
    setAudioBlob(null);
    setElapsed(0);
    setResult(null);
    setError(null);
  }, []);

  const acceptAudioBlob = useCallback((blob: Blob) => {
    clearTimer();
    stopTracks();
    setIsRecording(false);
    mediaRecorderRef.current = null;

    if (!blob.size) {
      setError('Запись получилась пустой. Проверьте доступ к микрофону и попробуйте ещё раз.');
      return;
    }
    if (blob.size > MAX_CLIENT_AUDIO_BYTES) {
      setError('Запись слишком большая для AI-проверки. Запишите более короткий ответ — до 2 минут.');
      return;
    }

    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    setAudioBlob(blob);
    setAudioUrl(url);
    setResult(null);
    setError(null);
    onPracticed();
  }, [clearTimer, onPracticed, stopTracks]);

  const startRecording = useCallback(async () => {
    resetRecording();
    try {
      if (!window.isSecureContext) {
        throw new Error('Микрофон работает только на защищённой HTTPS-странице. Откройте otto-goethe-a1.netlify.app напрямую.');
      }
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Этот встроенный браузер не поддерживает прямую запись. Нажмите «Записать другим способом» ниже.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!stream.getAudioTracks().length) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Браузер не передал аудиодорожку. Проверьте разрешение на микрофон.');
      }

      streamRef.current = stream;
      chunksRef.current = [];
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const options: MediaRecorderOptions = { audioBitsPerSecond: 48000 };
      if (mimeType) options.mimeType = mimeType;

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onerror = () => {
        clearTimer();
        stopTracks();
        setIsRecording(false);
        setError('Браузер остановил запись микрофона. Попробуйте ещё раз или используйте запасной способ записи.');
      };
      recorder.onstart = () => {
        setElapsed(0);
        setIsRecording(true);
        setError(null);
        timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || 'audio/webm';
        acceptAudioBlob(new Blob(chunksRef.current, { type }));
      };
      recorder.start(250);
    } catch (recordingError) {
      clearTimer();
      stopTracks();
      setIsRecording(false);
      setError(microphoneErrorMessage(recordingError));
    }
  }, [acceptAudioBlob, clearTimer, resetRecording, stopTracks]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') recorder.stop();
  }, []);

  const handleAudioFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) acceptAudioBlob(new Blob([file], { type: file.type || guessAudioMime(file.name) }));
    event.target.value = '';
  }, [acceptAudioBlob]);

  const checkWithOtto = useCallback(async () => {
    if (!audioBlob || checking) return;
    if (audioBlob.size > MAX_CLIENT_AUDIO_BYTES) {
      setError('Запись слишком большая. Запишите ответ короче.');
      return;
    }

    setChecking(true);
    setError(null);
    setResult(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65000);

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await fetch('/api/check-sprechen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ ...evaluation, audioBase64, mimeType: audioBlob.type || 'audio/webm' }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || `Проверка Otto недоступна (${response.status}). Попробуйте ещё раз.`);
      setResult(payload as EvaluationResult);
      setAiAvailable(true);
    } catch (checkingError) {
      if (checkingError instanceof DOMException && checkingError.name === 'AbortError') {
        setError('Проверка заняла слишком много времени. Запись сохранена — нажмите «Проверить с Otto» ещё раз.');
      } else {
        setError(checkingError instanceof Error ? checkingError.message : 'Не удалось проверить запись.');
      }
    } finally {
      window.clearTimeout(timeout);
      setChecking(false);
    }
  }, [audioBlob, checking, evaluation]);

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">Ответьте вслух</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{hint || 'Нажмите микрофон, скажите ответ и остановите запись. Не нужно говорить медленно или по слогам.'}</p>
        </div>
        <div className={cn('rounded-lg px-3 py-2 text-sm font-bold tabular-nums', isRecording ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700')}>{formatTime(elapsed)}</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={isRecording ? stopRecording : startRecording} aria-label={isRecording ? 'Остановить запись' : 'Начать запись'} className={cn('flex h-16 w-16 items-center justify-center rounded-full transition active:scale-95', isRecording ? 'animate-pulse bg-red-600 text-white' : 'border-2 border-slate-300 bg-white text-slate-900 hover:border-slate-500')}>
          {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-7 w-7" />}
        </button>
        <div className="min-w-[150px] flex-1">
          <p className={cn('text-sm font-semibold', isRecording ? 'text-red-700' : audioBlob ? 'text-emerald-700' : 'text-slate-600')}>{isRecording ? 'Запись идёт… говорите' : audioBlob ? 'Запись готова' : 'Нажмите на микрофон'}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">При первом запуске браузер попросит разрешить микрофон.</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" capture="user" onChange={handleAudioFile} className="hidden" />

      {!isRecording && !audioBlob && (
        <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Записать другим способом / выбрать аудио</button>
      )}

      {audioUrl && !isRecording && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <audio src={audioUrl} controls preload="metadata" className="h-11 min-w-0 max-w-full flex-1" />
          <button type="button" onClick={resetRecording} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Перезаписать</button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button type="button" onClick={checkWithOtto} disabled={checking || aiAvailable === false} className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
            <Sparkles className="h-4 w-4" />{checking ? 'Otto слушает и анализирует…' : 'Проверить с Otto'}
          </button>
          <p className="mt-2 text-xs leading-5 text-slate-400">Проверяется выполнение задания и понятность ответа A1. Точная фонетическая оценка произношения не заявляется.</p>
        </div>
      )}

      {aiAvailable === false && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800">Запись микрофона доступна, но AI-проверка на сервере сейчас не подключена. Нужно проверить переменную OPENAI_API_KEY в Netlify.</div>
      )}

      {result && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" />{result.score} / 100</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{result.feedbackRu}</p>
          {result.feedbackDe && <p className="mt-2 text-sm leading-6 text-slate-600">{result.feedbackDe}</p>}
          {result.transcript && <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-slate-600"><span className="font-semibold">Распознано:</span> {result.transcript}</div>}
          {result.missing && result.missing.length > 0 && <p className="mt-2 text-sm text-slate-600">Не прозвучало: {result.missing.join(', ')}</p>}
        </div>
      )}

      {error && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{error}<button type="button" onClick={() => fileInputRef.current?.click()} className="ml-1 font-bold underline underline-offset-2">Использовать запасной способ</button></div>}
      {!audioBlob && !isRecording && <div className="mt-4 flex items-center gap-2 text-sm text-slate-400"><Volume2 className="h-4 w-4" />Запись остаётся только в текущем окне до отправки на AI-проверку.</div>}
    </div>
  );
}

function microphoneErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'SecurityError') return 'Доступ к микрофону запрещён. Разрешите микрофон для этого сайта в браузере и нажмите запись ещё раз.';
    if (error.name === 'NotFoundError') return 'Микрофон не найден. Проверьте, что он подключён и доступен браузеру.';
    if (error.name === 'NotReadableError' || error.name === 'AbortError') return 'Микрофон сейчас занят другим приложением или браузер не может его открыть. Закройте другую запись/звонок и попробуйте снова.';
  }
  return error instanceof Error ? error.message : 'Не удалось включить микрофон. Попробуйте запасной способ записи.';
}

function guessAudioMime(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.m4a') || lower.endsWith('.mp4')) return 'audio/mp4';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.ogg') || lower.endsWith('.oga')) return 'audio/ogg';
  return 'audio/webm';
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось подготовить аудио.'));
    reader.onload = () => {
      const value = String(reader.result || '');
      const comma = value.indexOf(',');
      resolve(comma >= 0 ? value.slice(comma + 1) : value);
    };
    reader.readAsDataURL(blob);
  });
}
