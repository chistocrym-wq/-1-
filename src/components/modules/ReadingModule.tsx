import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleX, Globe2, Mail, Signpost } from 'lucide-react';
import { lesenExamSets, type LesenBinaryAnswer, type LesenChoiceAnswer, type LesenOption } from '@/data/lesen/examSets';
import { CompactTranslationEye } from '@/components/common/CompactTranslationEye';
import { HoverTranslateText } from '@/components/common/HoverTranslateText';
import { cn } from '@/lib/utils';

interface Props { onBack:()=>void; onComplete:(score:number,total:number)=>void }
type Part=1|2|3;
type Answer=LesenBinaryAnswer|LesenChoiceAnswer;
type Task=
  |{kind:'teil1';text:string;sourceTitle:string;statement:string;correct:LesenBinaryAnswer;explanation:string}
  |{kind:'teil2';situation:string;a:LesenOption;b:LesenOption;correct:LesenChoiceAnswer;explanation:string}
  |{kind:'teil3';place:string;heading:string;text:string;statement:string;correct:LesenBinaryAnswer;explanation:string};

const INTRO_DE='Lesen hat drei Teile. Sie lesen kurze E-Mails und Nachrichten, Webseiten und Anzeigen sowie Schilder und Hinweise. Finden Sie die wichtige Information und wählen Sie die passende Antwort.';
const INTRO_RU='Чтение состоит из трёх частей: короткие письма и сообщения, сайты и объявления, вывески и указания. Нужно найти важную информацию и выбрать подходящий ответ.';
const META={
  1:{title:'Briefe & Nachrichten',de:'Kurze E-Mails und Nachrichten lesen und Aussagen als richtig oder falsch markieren.',ru:'Короткие письма и сообщения: прочитать и определить, верно или неверно утверждение.',icon:Mail},
  2:{title:'Webseiten & Anzeigen',de:'Eine Situation lesen und zwischen zwei Informationsquellen a oder b wählen.',ru:'Прочитать ситуацию и выбрать, где есть нужная информация: a или b.',icon:Globe2},
  3:{title:'Schilder & Hinweise',de:'Kurze Hinweise, Schilder und Anzeigen lesen und Aussagen prüfen.',ru:'Прочитать вывески и объявления и проверить утверждение.',icon:Signpost},
} as const;

export function ReadingModule({onBack,onComplete}:Props){
  const[part,setPart]=useState<Part|null>(null);
  const[test,setTest]=useState(1);
  const[index,setIndex]=useState(0);
  const[selected,setSelected]=useState<Answer|null>(null);
  const[checked,setChecked]=useState(false);
  const[score,setScore]=useState(0);
  const[finished,setFinished]=useState(false);
  const totalTests=lesenExamSets.length;
  const tasks=useMemo(()=>part?makeTest(part,test):[],[part,test]);
  const current=tasks[index];

  const reset=()=>{setIndex(0);setSelected(null);setChecked(false);setScore(0);setFinished(false);window.scrollTo({top:0,behavior:'smooth'})};
  const open=(p:Part)=>{setPart(p);setTest(1);reset()};
  const back=()=>{setPart(null);reset()};
  const choose=(n:number)=>{setTest(n);reset()};
  const check=()=>{if(!current||selected===null||checked)return;setChecked(true);if(selected===current.correct)setScore(v=>v+1)};
  const next=()=>{if(!checked)return;if(index===tasks.length-1){setFinished(true);onComplete(score,tasks.length);return}setIndex(v=>v+1);setSelected(null);setChecked(false);window.scrollTo({top:0,behavior:'smooth'})};

  if(!part)return <Home onBack={onBack} onOpen={open} totalTests={totalTests}/>;
  if(finished)return <Result part={part} score={score} total={tasks.length} onRetry={reset} onBack={back}/>;
  if(!current)return <div className="animate-fade-in"><Back onClick={back}/><p className="mt-4 text-slate-600">В этом тесте пока нет заданий.</p></div>;
  const correct=selected===current.correct;

  return <div className="animate-fade-in pb-8">
    <div className="mb-4 flex items-start gap-3">
      <Back onClick={back}/>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-black text-slate-950">Lesen · Teil {part}</h1>
        <p className="mt-1 text-sm text-slate-500">Test {test} von {totalTests} · Aufgabe {index+1} von {tasks.length}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-teal-600" style={{width:`${((index+1)/tasks.length)*100}%`}}/></div>
      </div>
      <CompactTranslationEye parts={[`Lesen Teil ${part}`,META[part].de]} translations={[`Чтение · часть ${part}`,META[part].ru]} title="Перевод"/>
    </div>
    <TestPicker current={test} total={totalTests} onChange={choose}/>
    <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border-l-4 border-teal-600 bg-teal-50 px-4 py-3 text-sm leading-6 text-slate-700">
      <HoverTranslateText text={instruction(part)}/>
      <CompactTranslationEye parts={[instruction(part)]} title="Перевод задания"/>
    </div>
    {current.kind==='teil1'&&<Teil1 task={current}/>} {current.kind==='teil2'&&<Teil2 task={current}/>} {current.kind==='teil3'&&<Teil3 task={current}/>} 
    <Answers kind={current.kind==='teil2'?'ab':'tf'} selected={selected} onSelect={setSelected}/>
    {checked&&<div className={cn('mb-4 rounded-2xl border p-4',correct?'border-emerald-200 bg-emerald-50':'border-rose-200 bg-rose-50')}><div className="flex gap-3">{correct?<CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700"/>:<CircleX className="h-5 w-5 shrink-0 text-rose-700"/>}<div><b>{correct?'Правильно':`Неверно. Правильный ответ: ${String(current.correct)}`}</b><p className="mt-1 text-sm text-slate-700">{current.explanation}</p></div></div></div>}
    <div className="flex justify-end">{!checked?<button onClick={check} disabled={selected===null} className="min-h-12 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white disabled:opacity-40">Проверить</button>:<button onClick={next} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white">{index===tasks.length-1?'Результат':'Следующее задание'}<ArrowRight className="h-4 w-4"/></button>}</div>
  </div>;
}

function Home({onBack,onOpen,totalTests}:{onBack:()=>void;onOpen:(p:Part)=>void;totalTests:number}){return <div className="animate-fade-in pb-8">
  <div className="mb-5 flex items-start gap-3">
    <Back onClick={onBack}/>
    <div className="min-w-0 flex-1"><h1 className="text-3xl font-black text-slate-950">Lesen</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600"><HoverTranslateText text={INTRO_DE}/></p></div>
    <CompactTranslationEye parts={[INTRO_DE]} translations={[INTRO_RU]} title="Перевод Lesen"/>
  </div>
  <div className="grid gap-4 lg:grid-cols-3">{([1,2,3] as Part[]).map(p=>{const m=META[p],Icon=m.icon;return <div key={p} className="flex min-h-[300px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-start justify-between gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white"><Icon className="h-6 w-6"/></span><CompactTranslationEye parts={[`Teil ${p}: ${m.title}`,m.de]} translations={[`Часть ${p}: ${m.ru}`,m.ru]} title={`Перевод Teil ${p}`}/></div><span className="text-xs font-black uppercase tracking-wider text-teal-700">Teil {p}</span><h2 className="mt-1 text-xl font-black text-slate-950"><HoverTranslateText text={m.title}/></h2><p className="mt-3 text-sm leading-6 text-slate-600"><HoverTranslateText text={m.de}/></p><div className="mt-auto pt-5"><p className="mb-3 rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900">{totalTests} полноценных тренировочных тестов</p><button onClick={()=>onOpen(p)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white">Начать тренировку<ArrowRight className="h-4 w-4"/></button></div></div>})}</div>
</div>}

function TestPicker({current,total,onChange}:{current:number;total:number;onChange:(n:number)=>void}){return <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3"><p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Test auswählen</p><div className="flex flex-wrap gap-1.5">{Array.from({length:total},(_,i)=>i+1).map(n=><button key={n} onClick={()=>onChange(n)} className={cn('h-9 min-w-9 rounded-lg px-2 text-xs font-bold',n===current?'bg-teal-600 text-white':'bg-slate-100 text-slate-600')}>{n}</button>)}</div></div>}
function Teil1({task}:{task:Extract<Task,{kind:'teil1'}>}){return <section className="mb-4 rounded-2xl border bg-[#fffefa] p-5 shadow-sm"><p className="mb-2 text-xs font-bold text-slate-400"><HoverTranslateText text={task.sourceTitle}/></p><div className="rounded-xl bg-white p-4 text-[15px] leading-7"><HoverTranslateText text={task.text}/></div><div className="mt-4 border-t pt-4 text-[16px] font-semibold leading-7"><HoverTranslateText text={task.statement}/></div></section>}
function Teil2({task}:{task:Extract<Task,{kind:'teil2'}>}){return <section className="mb-4 space-y-3"><div className="rounded-2xl border bg-white p-4 text-[16px] font-semibold leading-7"><HoverTranslateText text={task.situation}/></div><div className="grid gap-3 sm:grid-cols-2">{([['a',task.a],['b',task.b]] as const).map(([key,opt])=><div key={key} className="rounded-2xl border bg-white p-4"><b className="text-teal-700">{key.toUpperCase()} · <HoverTranslateText text={opt.heading}/></b><p className="mt-2 text-sm leading-6"><HoverTranslateText text={opt.text}/></p></div>)}</div></section>}
function Teil3({task}:{task:Extract<Task,{kind:'teil3'}>}){return <section className="mb-4 rounded-2xl border bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-400"><HoverTranslateText text={task.place}/></p><h2 className="mt-2 text-xl font-black"><HoverTranslateText text={task.heading}/></h2><p className="mt-3 text-sm leading-6"><HoverTranslateText text={task.text}/></p><div className="mt-4 border-t pt-4 text-[16px] font-semibold leading-7"><HoverTranslateText text={task.statement}/></div></section>}
function Answers({kind,selected,onSelect}:{kind:'ab'|'tf';selected:Answer|null;onSelect:(a:Answer)=>void}){const opts=kind==='ab'?[['a','a'],['b','b']]:[['richtig','Richtig'],['falsch','Falsch']];return <div className="mb-4 grid grid-cols-2 gap-3">{opts.map(([value,label])=><button key={value} onClick={()=>onSelect(value as Answer)} className={cn('min-h-12 rounded-xl border-2 px-4 py-3 font-bold',selected===value?'border-teal-500 bg-teal-50':'border-slate-200 bg-white')}>{label}</button>)}</div>}
function Result({part,score,total,onRetry,onBack}:{part:Part;score:number;total:number;onRetry:()=>void;onBack:()=>void}){return <div className="animate-fade-in"><div className="rounded-3xl border bg-white p-7 text-center shadow-sm"><BookOpen className="mx-auto h-12 w-12 text-teal-700"/><h1 className="mt-4 text-2xl font-black">Lesen · Teil {part}</h1><p className="mt-3 text-5xl font-black">{score}/{total}</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onRetry} className="min-h-11 rounded-xl border px-5 font-bold">Ещё раз</button><button onClick={onBack} className="min-h-11 rounded-xl bg-slate-900 px-5 font-bold text-white">К частям Lesen</button></div></div></div>}
function Back({onClick}:{onClick:()=>void}){return <button onClick={onClick} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white" aria-label="Назад"><ArrowLeft className="h-5 w-5"/></button>}
function instruction(part:Part){return part===1?'Lesen Sie die Texte und die Aussagen. Wählen Sie: Richtig oder Falsch.':part===2?'Lesen Sie die Situation. Wo finden Sie die passende Information? Wählen Sie a oder b.':'Lesen Sie die Hinweise und die Aussagen. Wählen Sie: Richtig oder Falsch.'}
function makeTest(part:Part,test:number):Task[]{const set=lesenExamSets[test-1];if(!set)return[];if(part===1){const tasks:Task[]=[];for(const block of set.teil1)for(const st of block.statements)tasks.push({kind:'teil1',text:block.text,sourceTitle:block.title,statement:st.statement,correct:st.correct,explanation:st.explanation});return tasks}if(part===2)return set.teil2.map(t=>({kind:'teil2',situation:t.situation,a:t.a,b:t.b,correct:t.correct,explanation:t.explanation}));return set.teil3.map(t=>({kind:'teil3',place:t.place,heading:t.heading,text:t.text,statement:t.statement,correct:t.correct,explanation:t.explanation}))}
