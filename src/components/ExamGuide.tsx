import { useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, Headphones, Mic, PenTool, Printer, Search, Sparkles, Volume2 } from 'lucide-react';
import { HoverTranslateText } from '@/components/common/HoverTranslateText';

type Page = 'menu' | 'plan' | 'schreiben' | 'horen' | 'sprechen' | 'grammar' | 'words' | 'alphabet' | 'weekdays' | 'months' | 'time-dates' | 'numbers' | 'phone-prices' | 'nicht-kein' | 'aber-leider';
interface ExamGuideProps { onBack: () => void }

type Row = string[];

const verbs: Row[] = [
  ['sein','быть'],['haben','иметь'],['heißen','называться'],['kommen','приходить / приезжать'],['wohnen','жить'],['sprechen','говорить'],['lernen','учить'],['arbeiten','работать'],['machen','делать'],['gehen','идти'],['fahren','ехать'],['bleiben','оставаться'],['essen','есть'],['trinken','пить'],['kaufen','покупать'],['bezahlen','платить'],['finden','находить'],['suchen','искать'],['brauchen','нуждаться'],['möchten','хотеть вежливо'],['können','мочь'],['müssen','быть должным'],['helfen','помогать'],['treffen','встречаться'],['besuchen','посещать'],['schreiben','писать'],['lesen','читать'],['bringen','приносить']
];
const nouns: Row[] = [
  ['die Familie','семья'],['der Freund','друг'],['die Freundin','подруга'],['das Kind','ребёнок'],['die Wohnung','квартира'],['das Zimmer','комната'],['die Stadt','город'],['die Straße','улица'],['der Bahnhof','вокзал'],['die Schule','школа'],['die Arbeit','работа'],['der Beruf','профессия'],['der Arzt','врач'],['die Apotheke','аптека'],['das Restaurant','ресторан'],['das Hotel','гостиница'],['der Supermarkt','супермаркет'],['die Bäckerei','пекарня'],['die Post','почта'],['die Bank','банк'],['der Bus','автобус'],['der Zug','поезд'],['das Taxi','такси'],['das Fahrrad','велосипед'],['die Fahrkarte','билет'],['das Geld','деньги'],['die Zeit','время'],['die Uhr','часы / время'],['das Essen','еда'],['das Wasser','вода'],['das Brot','хлеб'],['das Geschenk','подарок']
];
const questions: Row[] = [['Wer?','Кто?'],['Was?','Что?'],['Wo?','Где?'],['Wohin?','Куда?'],['Woher?','Откуда?'],['Wann?','Когда?'],['Wie?','Как?'],['Warum?','Почему?'],['Wie viel?','Сколько?'],['Wie lange?','Как долго?'],['Wie alt?','Сколько лет?'],['Welche?','Какой / какая / какие?']];
const alphabet: Row[] = [['A','а'],['B','бэ'],['C','цэ'],['D','дэ'],['E','э'],['F','эф'],['G','гэ'],['H','ха'],['I','и'],['J','йот'],['K','ка'],['L','эль'],['M','эм'],['N','эн'],['O','о'],['P','пэ'],['Q','ку'],['R','эр'],['S','эс'],['T','тэ'],['U','у'],['V','фау'],['W','вэ'],['X','икс'],['Y','юпсилон'],['Z','цэт'],['Ä','э'],['Ö','ё'],['Ü','ю'],['ß','эс-цэт']];
const weekdays: Row[] = [['Montag','мо́нтаг','понедельник'],['Dienstag','ди́нстаг','вторник'],['Mittwoch','ми́твох','среда'],['Donnerstag','до́нэрстаг','четверг'],['Freitag','фра́йтаг','пятница'],['Samstag','за́мстаг','суббота'],['Sonntag','зо́нтаг','воскресенье']];
const months: Row[] = [['Januar','я́нуар','январь'],['Februar','фе́бруар','февраль'],['März','мэрц','март'],['April','апри́ль','апрель'],['Mai','май','май'],['Juni','ю́ни','июнь'],['Juli','ю́ли','июль'],['August','аугу́ст','август'],['September','зэптэ́мба','сентябрь'],['Oktober','окто́ба','октябрь'],['November','новэ́мба','ноябрь'],['Dezember','дэцэ́мба','декабрь']];
const timeDates: Row[] = [['Wie spät ist es?','ви шпэт ист эс?','Который час?'],['Es ist acht Uhr.','эс ист ахт у́а','Сейчас восемь часов.'],['halb neun','хальб нойн','половина девятого / 8:30'],['Viertel nach acht','фи́ртель нахт ахт','четверть девятого / 8:15'],['Viertel vor neun','фи́ртель фор нойн','без четверти девять / 8:45'],['am Montag','ам мо́нтаг','в понедельник'],['am 3. Mai','ам дриттэн май','3 мая'],['im September','им зэптэ́мба','в сентябре'],['um 18 Uhr','ум ахтцэн у́а','в 18:00']];
const numberRows: Row[] = [['0','null','ноль'],['1','eins','один'],['2','zwei','два'],['3','drei','три'],['4','vier','четыре'],['5','fünf','пять'],['6','sechs','шесть'],['7','sieben','семь'],['8','acht','восемь'],['9','neun','девять'],['10','zehn','десять'],['11','elf','одиннадцать'],['12','zwölf','двенадцать'],['13','dreizehn','тринадцать'],['20','zwanzig','двадцать'],['21','einundzwanzig','двадцать один'],['30','dreißig','тридцать'],['40','vierzig','сорок'],['50','fünfzig','пятьдесят'],['60','sechzig','шестьдесят'],['70','siebzig','семьдесят'],['80','achtzig','восемьдесят'],['90','neunzig','девяносто'],['100','hundert','сто']];
const phonePrices: Row[] = [['Wie ist Ihre Telefonnummer?','ви ист и́рэ тэлефо́ннумэр?','Какой у Вас номер телефона?'],['null eins sieben sechs …','нуль айнс зи́бэн зэкс…','0 1 7 6 …'],['Wie viel kostet das?','ви филь ко́стэт дас?','Сколько это стоит?'],['Das kostet zwölf Euro fünfzig.','дас ко́стэт цвёльф о́йро фю́нфцих','Это стоит 12 евро 50 центов.'],['19,95 €','нойнцэн о́йро фю́нфуннойнцих','19 евро 95 центов']];
const nichtKein: Row[] = [['nicht','нихт','не — отрицает действие, признак или обстоятельство'],['Ich komme nicht.','их ко́мэ нихт','Я не приду.'],['Das ist nicht teuer.','дас ист нихт то́йа','Это не дорого.'],['kein','кайн','нет / никакой — отрицает существительное'],['Ich habe kein Auto.','их ха́бэ кайн а́уто','У меня нет машины.'],['Ich habe keine Zeit.','их ха́бэ ка́йнэ цайт','У меня нет времени.']];
const aberLeider: Row[] = [['aber','а́ба','но — противопоставление'],['Ich komme, aber später.','их ко́мэ, а́ба шпэ́та','Я приду, но позже.'],['leider','ла́йда','к сожалению'],['Leider kann ich nicht kommen.','ла́йда кан их нихт ко́мэн','К сожалению, я не могу прийти.'],['Aber leider …','а́ба ла́йда','Но, к сожалению…']];
const schreibenPhrases: Row[] = [
  ['Sehr geehrte Damen und Herren,','Уважаемые дамы и господа,'],['Liebe Anna, / Lieber Peter,','Дорогая Анна / Дорогой Петер,'],['Ich möchte mich für den Kurs anmelden.','Я хочу записаться на курс.'],['Wann beginnt der Kurs?','Когда начинается курс?'],['Wie viel kostet der Kurs?','Сколько стоит курс?'],['Können Sie mir bitte Informationen schicken?','Можете прислать мне информацию?'],['Ich kann leider nicht kommen.','К сожалению, я не могу прийти.'],['Ich freue mich auf Ihre Antwort.','Буду ждать Вашего ответа.'],['Mit freundlichen Grüßen','С уважением'],['Viele Grüße','С наилучшими пожеланиями']
];

export function ExamGuide({ onBack }: ExamGuideProps) {
  const [page, setPage] = useState<Page>('menu');
  if (page === 'menu') return <GuideMenu onBack={onBack} onOpen={setPage} />;
  if (page === 'plan') return <DetailShell title="Как готовиться" onBack={() => setPage('menu')}><Plan /></DetailShell>;
  if (page === 'schreiben') return <DetailShell title="Гайд Schreiben" onBack={() => setPage('menu')}><SchreibenGuide /></DetailShell>;
  if (page === 'horen') return <DetailShell title="Гайд Hören" onBack={() => setPage('menu')}><HorenGuide onOpen={setPage} /></DetailShell>;
  if (page === 'sprechen') return <DetailShell title="Гайд Sprechen" onBack={() => setPage('menu')}><SprechenGuide onOpen={setPage} /></DetailShell>;
  if (page === 'grammar') return <DetailShell title="Грамматика A1" onBack={() => setPage('menu')}><Grammar /></DetailShell>;
  if (page === 'words') return <DetailShell title="Мини-словарь A1" onBack={() => setPage('menu')}><WordLists /></DetailShell>;
  if (page === 'alphabet') {
    const rows = alphabet.map(([a,b]) => [a,b,'буква']);
    return <DetailShell title="Немецкий алфавит" onBack={() => setPage('sprechen')}><SimpleTable rows={rows} headers={['Буква','Русская транскрипция','Что запомнить']} /><PrintButton title="Немецкий алфавит A1" headers={['Буква','Русская транскрипция','Что запомнить']} rows={rows} /></DetailShell>;
  }
  const detailMap: Record<string,{title:string;rows:Row[]}> = {
    weekdays:{title:'Дни недели',rows:weekdays},months:{title:'Месяцы',rows:months},'time-dates':{title:'Время и даты',rows:timeDates},numbers:{title:'Числа 0–100',rows:numberRows},'phone-prices':{title:'Телефонные номера и цены',rows:phonePrices},'nicht-kein':{title:'nicht и kein',rows:nichtKein},'aber-leider':{title:'aber и leider',rows:aberLeider}
  };
  const detail = detailMap[page];
  return <DetailShell title={detail.title} onBack={() => setPage('horen')}><SimpleTable rows={detail.rows} headers={['Немецкий','Русская транскрипция','Перевод / смысл']} /><PrintButton title={detail.title} headers={['Немецкий','Русская транскрипция','Перевод / смысл']} rows={detail.rows} /></DetailShell>;
}

function GuideMenu({ onBack, onOpen }: { onBack:()=>void; onOpen:(page:Page)=>void }) {
  const items = [
    ['plan','Как готовиться','План занятий и распределение времени',Sparkles],['schreiben','Schreiben','Письмо, формуляр, готовые фразы',PenTool],['horen','Hören','Что слушать и что запомнить',Headphones],['sprechen','Sprechen','Алфавит, слова, вопросы и речь',Mic],['grammar','Грамматика A1','Только базовые конструкции',BookOpen],['words','Мини-словарь','Самые нужные слова для экзамена',Search]
  ] as const;
  return <div className="animate-fade-in pb-8"><div className="mb-6 flex items-center gap-3"><Back onClick={onBack}/><div><p className="text-sm font-semibold text-teal-700">База Отто</p><h1 className="text-2xl font-black text-slate-950">Гайды и помощники</h1><p className="text-sm text-slate-500">Выберите раздел — каждый открывается отдельно</p></div></div><div className="mx-auto max-w-2xl space-y-3">{items.map(([id,title,desc,Icon])=><button key={id} type="button" onClick={()=>onOpen(id)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50"><Icon className="h-6 w-6 text-teal-700"/></span><span className="min-w-0 flex-1"><b className="block text-slate-950">{title}</b><span className="mt-1 block text-sm text-slate-500">{desc}</span></span><ArrowRight className="h-5 w-5 shrink-0 text-slate-400"/></button>)}</div></div>;
}

function DetailShell({ title, onBack, children }: { title:string; onBack:()=>void; children:ReactNode }) {
  return <div className="animate-fade-in pb-10"><div className="mb-5 flex items-start gap-3"><Back onClick={onBack}/><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Помощник Отто</p><h1 className="break-words text-2xl font-black text-slate-950">{title}</h1></div><img src="/otto.png" alt="Отто" className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"/></div>{children}</div>;
}

function Plan() {
  return <div className="space-y-5"><Hero title="Коротко, регулярно, по формату экзамена" text="Слова → слушание → тренировка Отто по всем модулям → повтор ошибок. Лучше каждый день понемногу, чем редко и долго."/><div className="grid gap-3 sm:grid-cols-2"><Time time="10–15 мин" title="Слова" text="готовые сочетания и полезные фразы"/><Time time="15–20 мин" title="Hören" text="слушать и запоминать: числа, время, короткие диалоги"/><Time time="20–30 мин" title="Отто" text="занятия по всем модулям: Lesen, Hören, Schreiben, Sprechen"/><Time time="5–10 мин" title="Повтор" text="ошибки и фразы, которые пока не получаются"/></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black text-slate-950">Как двигаться</h2><ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700"><li>1. Сначала научитесь узнавать частые слова и числа.</li><li>2. Каждый день слушайте короткие фразы и диалоги.</li><li>3. Параллельно проходите задания всех четырёх модулей Отто.</li><li>4. Перед экзаменом включайте тестовый режим с таймером.</li></ol></div></div>;
}

function SchreibenGuide() {
  return <div className="space-y-5"><Hero title="Письмо A1: просто и по трём пунктам" text="Не усложняйте. Дайте понятный ответ на каждый пункт, добавьте обращение и прощание."/><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-black text-amber-900">Формула</p><p className="mt-2 text-sm leading-6 text-slate-700">Обращение → пункт 1 → пункт 2 → пункт 3 → короткое завершение → прощание → имя.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black text-slate-950">Полезные фразы</h2><p className="mt-1 text-xs text-slate-500">Наведи на немецкое слово — перевод появится сверху.</p><div className="mt-4 space-y-2">{schreibenPhrases.map(([de])=><div key={de} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800"><HoverTranslateText text={de}/></div>)}</div></div><PrintButton title="Schreiben A1 — полезные фразы" headers={['Немецкий','Перевод']} rows={schreibenPhrases}/></div>;
}

function HorenGuide({ onOpen }: { onOpen:(page:Page)=>void }) {
  const items:[Page,string,string][] = [['weekdays','Дни недели','7 слов'],['months','Месяцы','12 слов'],['time-dates','Время и даты','частые формулировки'],['numbers','Числа 0–100','числа и десятки'],['phone-prices','Телефон и цены','цифры на слух'],['nicht-kein','nicht и kein','отрицание'],['aber-leider','aber и leider','изменение смысла']];
  return <div className="space-y-5"><Hero title="Hören: слушайте ключевую информацию" text="Главное — услышать число, время, дату, место, цену, отрицание и изменение планов. Не пытайтесь переводить каждое слово."/><div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><h2 className="font-black text-sky-950">Что нужно знать наизусть</h2><p className="mt-1 text-sm text-sky-800">Нажимайте на тему: откроется отдельная страница Отто с произношением, русской транскрипцией, переводом и возможностью сохранить в PDF.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map(([id,title,meta])=><button key={id} type="button" onClick={()=>onOpen(id)} className="flex min-h-[64px] items-center justify-between gap-3 rounded-xl border border-sky-200 bg-white px-4 py-3 text-left transition hover:border-sky-400"><span><b className="block text-slate-950">{title}</b><span className="text-xs text-slate-500">{meta}</span></span><ArrowRight className="h-4 w-4 text-sky-700"/></button>)}</div></div><div className="grid gap-3 sm:grid-cols-3"><Mini title="Teil 1" text="a / b / c · каждый текст звучит 2 раза"/><Mini title="Teil 2" text="Richtig / Falsch · каждый текст звучит 1 раз"/><Mini title="Teil 3" text="a / b / c · каждый текст звучит 2 раза"/></div></div>;
}

function SprechenGuide({ onOpen }: { onOpen:(page:Page)=>void }) {
  return <div className="space-y-5"><Hero title="Sprechen: короткая понятная речь" text="Представьтесь, задайте простой вопрос, ответьте и сформулируйте вежливую просьбу. Говорите вслух."/><button type="button" onClick={()=>onOpen('alphabet')} className="flex w-full items-center gap-4 rounded-2xl border border-rose-200 bg-white p-5 text-left transition hover:border-rose-400"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50"><Volume2 className="h-6 w-6 text-rose-700"/></span><span className="flex-1"><b className="block text-slate-950">Немецкий алфавит и произношение</b><span className="text-sm text-slate-500">Русская транскрипция + печать / PDF</span></span><ArrowRight className="h-5 w-5 text-slate-400"/></button><div className="grid gap-3 sm:grid-cols-3"><PrintCard title="Существительные" rows={nouns}/><PrintCard title="Глаголы" rows={verbs}/><PrintCard title="Вопросы" rows={questions}/></div></div>;
}

function Grammar() {
  return <div className="space-y-4"><Hero title="Только базовые конструкции A1" text="Не перегружайте себя теорией. Сначала научитесь уверенно строить простое предложение и вопрос."/><SimpleTable headers={['Конструкция','Формула','Пример']} rows={[["Обычное предложение","Подлежащее + глагол + остальное","Ich lerne Deutsch."],["W-вопрос","Вопросительное слово + глагол + подлежащее","Wo wohnen Sie?"],["Да/нет","Глагол + подлежащее + остальное","Kommen Sie heute?"],["Модальный глагол","Подлежащее + Modalverb + … + Infinitiv","Ich kann heute kommen."]]}/></div>;
}

function WordLists() {
  return <div className="space-y-5"><Hero title="Мини-словарь Отто" text="Повторяйте небольшими блоками и сразу используйте слова в вопросах и коротких фразах."/><WordTable title="Существительные" rows={nouns}/><WordTable title="Глаголы" rows={verbs}/><WordTable title="Вопросительные слова" rows={questions}/></div>;
}

function SimpleTable({ rows, headers }: { rows:Row[]; headers:string[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-slate-900 text-white"><tr>{headers.map(h=><th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row,i)=><tr key={`${row[0]}-${i}`} className="align-top">{row.map((cell,j)=><td key={j} className="px-4 py-3 leading-6 text-slate-700">{j===0?<HoverTranslateText text={cell}/>:cell}</td>)}</tr>)}</tbody></table></div>;
}
function WordTable({ title, rows }: { title:string; rows:Row[] }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black text-slate-950">{title}</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{rows.map(([de,ru])=><div key={de} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm"><HoverTranslateText text={de}/><span className="text-right text-slate-500">{ru}</span></div>)}</div></div> }
function Hero({ title, text }: { title:string; text:string }) { return <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm"><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-white/75">{text}</p></div> }
function Time({ time, title, text }: { time:string; title:string; text:string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><span className="text-xs font-black uppercase tracking-wider text-teal-700">{time}</span><h3 className="mt-1 font-black text-slate-950">{title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{text}</p></div> }
function Mini({ title, text }: { title:string; text:string }) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><b className="text-slate-950">{title}</b><p className="mt-1 text-sm leading-5 text-slate-600">{text}</p></div> }
function Back({ onClick }: { onClick:()=>void }) { return <button type="button" onClick={onClick} aria-label="Назад" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white"><ArrowLeft className="h-5 w-5 text-slate-600"/></button> }

function PrintCard({ title, rows }: { title:string; rows:Row[] }) {
  return <button type="button" onClick={()=>printTable(`Sprechen A1 — ${title}`,['Немецкий','Перевод'],rows)} className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300"><Download className="h-5 w-5 shrink-0 text-teal-700"/><span><b className="block text-slate-950">{title}</b><span className="text-xs text-slate-500">Сохранить отдельным PDF</span></span></button>;
}
function PrintButton({ title, headers, rows }: { title:string; headers:string[]; rows:Row[] }) {
  return <button type="button" onClick={()=>printTable(title,headers,rows)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Printer className="h-4 w-4"/>Скачать / распечатать PDF</button>;
}

function printTable(title:string, headers:string[], rows:Row[]) {
  const escape = (value:string) => value.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] || ch));
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) { window.print(); return; }
  const head = headers.map(h=>`<th>${escape(h)}</th>`).join('');
  const body = rows.map(row=>`<tr>${row.map(cell=>`<td>${escape(cell)}</td>`).join('')}</tr>`).join('');
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)}</title><style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#172033;margin:0}h1{font-size:24px;margin:0 0 8px}.sub{color:#64748b;margin:0 0 20px}.otto{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0f766e;padding-bottom:12px;margin-bottom:18px}.brand{font-weight:700;color:#0f766e}table{border-collapse:collapse;width:100%;font-size:12px}th{background:#0f172a;color:white;text-align:left}th,td{border:1px solid #cbd5e1;padding:8px;vertical-align:top}tr:nth-child(even) td{background:#f8fafc}.hint{margin-top:18px;font-size:11px;color:#64748b}@media print{button{display:none}}</style></head><body><div class="otto"><div><div class="brand">Тренажёр Отто</div><h1>${escape(title)}</h1><p class="sub">Zertifikat A1 · памятка для печати</p></div></div><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table><p class="hint">В окне печати выберите «Сохранить как PDF», если хотите скачать файл.</p><script>window.onload=()=>setTimeout(()=>window.print(),150)</script></body></html>`);
  popup.document.close();
}
