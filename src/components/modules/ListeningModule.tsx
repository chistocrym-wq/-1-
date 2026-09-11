import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleX, Headphones, RotateCcw } from 'lucide-react';
import { listeningTasks } from '@/data/listening';
import { CompactTranslationEye } from '@/components/common/CompactTranslationEye';
import { HoverTranslateText } from '@/components/common/HoverTranslateText';
import { cn } from '@/lib/utils';

interface Props { onBack:()=>void; onComplete:(score:number,total:number)=>void }
type Answer=number|boolean|null;
const PROGRESS_KEY='otto-hoeren-current';

export function ListeningModule({onBack,onComplete}:Props){
  const[index,setIndex]=useState(()=>{try{const n=Number(localStorage.getItem(PROGRESS_KEY)||0);return Number.isFinite(n)&&n>=0&&n<listeningTasks.length?n:0}catch{return 0}});
  const[selected,setSelected]=useState<Answer>(null);
  const[checked,setChecked]=useState(false);
  const[finished,setFinished]=useState(false);
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const task=listeningTasks[index];
  const audioSrc=useMemo(()=>`/audio/${String(task.number).padStart(3,'0')}.mp3`,[task.number]);
  const imageSrc=useMemo(()=>`/images/${String(task.number).padStart(3,'0')}.png`,[task.number]);
  const parts=task.type==='multiple-choice'?[task.title,task.instruction,task.prompt,...task.options]:[task.title,task.instruction,task.prompt,'Richtig','Falsch'];
  const isCorrect=task.type==='multiple-choice'?selected===task.correctIndex:selected===task.correctAnswer;

  useEffect(()=>{setSelected(null);setChecked(false);audioRef.current?.pause();if(audioRef.current)audioRef.current.currentTime=0;try{localStorage.setItem(PROGRESS_KEY,String(index))}catch{}},[index]);

  const check=()=>{
    if(selected===null||checked)return;
    setChecked(true);
    onComplete(isCorrect?1:0,1);
  };
  const next=()=>{
    if(!checked)return;
    if(index>=listeningTasks.length-1){setFinished(true);try{localStorage.removeItem(PROGRESS_KEY)}catch{};return;}
    setIndex(v=>v+1);window.scrollTo({top:0,behavior:'smooth'});
  };
  const restart=()=>{setIndex(0);setSelected(null);setChecked(false);setFinished(false);try{localStorage.removeItem(PROGRESS_KEY)}catch{}};

  if(finished)return <div className="animate-fade-in pb-8"><div className="mb-5 flex items-center gap-3"><Back onClick={onBack}/><h1 className="text-2xl font-black">Hören</h1></div><div className="rounded-3xl border bg-white p-7 text-center"><Headphones className="mx-auto h-12 w-12 text-sky-700"/><h2 className="mt-4 text-2xl font-black">Training abgeschlossen</h2><p className="mt-2 text-slate-500">Все задания Hören пройдены. Результаты уже записаны в общий прогресс.</p><button onClick={restart} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 font-bold"><RotateCcw className="h-4 w-4"/>Noch einmal</button></div></div>;

  return <div className="animate-fade-in pb-8">
    <div className="mb-5 flex items-start gap-3">
      <Back onClick={onBack}/>
      <div className="min-w-0 flex-1"><h1 className="text-2xl font-black text-slate-950">Hören</h1><p className="mt-1 text-sm text-slate-500">Aufgabe {index+1} von {listeningTasks.length}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-sky-600" style={{width:`${((index+1)/listeningTasks.length)*100}%`}}/></div></div>
      <CompactTranslationEye parts={['Hören','Hören Sie den Text und wählen Sie die passende Antwort.']} translations={['Аудирование','Прослушайте текст и выберите подходящий ответ.']} title="Перевод"/>
    </div>

    <section className="overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-sky-50 p-5">
        <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-sky-700">Aufgabe {task.number}</p><h2 className="mt-1 text-xl font-black text-slate-950"><HoverTranslateText text={task.title}/></h2></div>
        <CompactTranslationEye parts={parts} title="Перевод карточки"/>
      </div>
      <div className="space-y-5 p-5">
        <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700"><HoverTranslateText text={task.instruction}/></p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <audio ref={audioRef} src={audioSrc} controls preload="metadata" className="w-full" onError={()=>{if(task.number===73&&audioRef.current)audioRef.current.src='/audio/073%20.mp3'}}/>
        </div>
        <img src={imageSrc} alt="Aufgabe" className="mx-auto max-h-64 max-w-full rounded-xl object-contain" onError={e=>{e.currentTarget.style.display='none'}}/>
        <p className="text-lg font-bold leading-7 text-slate-950"><HoverTranslateText text={task.prompt}/></p>
        <div className="grid gap-3">
          {task.type==='multiple-choice'?task.options.map((option,n)=><button key={`${option}-${n}`} disabled={checked} onClick={()=>setSelected(n)} className={cn('min-h-12 rounded-xl border-2 bg-white px-4 py-3 text-left font-semibold',selected===n?'border-sky-500 bg-sky-50':'border-slate-200')}><span className="mr-2 font-black text-sky-700">{String.fromCharCode(65+n)}.</span><HoverTranslateText text={option}/></button>):([true,false] as boolean[]).map(value=><button key={String(value)} disabled={checked} onClick={()=>setSelected(value)} className={cn('min-h-12 rounded-xl border-2 bg-white px-4 py-3 text-left font-semibold',selected===value?'border-sky-500 bg-sky-50':'border-slate-200')}><HoverTranslateText text={value?'Richtig':'Falsch'}/></button>)}
        </div>
      </div>
    </section>

    {checked&&<div className={cn('mt-4 rounded-2xl border p-4',isCorrect?'border-emerald-200 bg-emerald-50':'border-rose-200 bg-rose-50')}><div className="flex items-center gap-2">{isCorrect?<CheckCircle2 className="h-5 w-5 text-emerald-700"/>:<CircleX className="h-5 w-5 text-rose-700"/>}<b>{isCorrect?'Правильно':'Неверно'}</b></div></div>}
    <div className="mt-5 flex justify-end">{!checked?<button onClick={check} disabled={selected===null} className="min-h-12 rounded-xl bg-slate-900 px-6 font-bold text-white disabled:opacity-40">Проверить</button>:<button onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 font-bold text-white">{index===listeningTasks.length-1?'Завершить':'Следующее'}<ArrowRight className="h-4 w-4"/></button>}</div>
  </div>;
}

function Back({onClick}:{onClick:()=>void}){return <button onClick={onClick} aria-label="Назад" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white"><ArrowLeft className="h-5 w-5"/></button>}
