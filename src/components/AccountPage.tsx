import { BarChart3, BookOpenCheck, CheckCircle2, Target } from 'lucide-react';
import type { Progress } from '@/types';
import { ProgressBar } from '@/components/ProgressBar';
import { OTTO_CHARACTER_SRC } from '../ottoCharacter';

interface Props { progress: Progress }

export function AccountPage({ progress }: Props) {
  const ids = ['lesen', 'horen', 'schreiben', 'sprechen'];
  let answered = 0;
  let correct = 0;
  ids.forEach((id) => { answered += progress[id]?.answered ?? 0; correct += progress[id]?.correct ?? 0; });
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const completed = ids.reduce((sum, id) => sum + (progress[id]?.completed ?? 0), 0);

  return (
    <div className="animate-fade-in pb-28">
      <section className="otto-page-hero otto-account-hero">
        <div><p className="otto-kicker">Личный кабинет</p><h1>Ваш прогресс в подготовке A1</h1></div>
        <div className="otto-page-hero-character" aria-hidden="true"><img src={OTTO_CHARACTER_SRC} alt="" /></div>
      </section>

      <section className="otto-account-card">
        <div className="otto-account-stat"><span><BarChart3 /></span><strong>{answered}</strong><small>выполнено заданий</small></div>
        <div className="otto-account-stat"><span><CheckCircle2 /></span><strong>{accuracy}%</strong><small>правильных ответов</small></div>
        <div className="otto-account-stat"><span><BookOpenCheck /></span><strong>{completed}</strong><small>завершено наборов</small></div>
      </section>

      <section className="otto-card mt-4 rounded-[28px] border border-white/90 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,.08)]">
        <div className="mb-3 flex items-center justify-between"><div><p className="otto-kicker">Общий результат</p><h2 className="text-xl font-black text-slate-950">Точность ответов</h2></div><Target className="h-8 w-8 text-[#0F7D74]" /></div>
        <ProgressBar value={accuracy} max={100} />
        <p className="mt-3 text-sm text-slate-500">Статистика формируется из выполненных заданий во всех четырёх модулях.</p>
      </section>
    </div>
  );
}
