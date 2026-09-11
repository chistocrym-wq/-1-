import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Headphones,
  Lightbulb,
  Mic,
  PenTool,
  Search,
  Sparkles,
  Timer,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamGuideProps {
  onBack: () => void;
}

type Section = 'plan' | 'schreiben' | 'horen' | 'sprechen' | 'grammar' | 'words' | 'resources';

const sections: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: 'plan', label: 'Как готовиться', icon: Sparkles },
  { id: 'schreiben', label: 'Schreiben', icon: PenTool },
  { id: 'horen', label: 'Hören', icon: Headphones },
  { id: 'sprechen', label: 'Sprechen', icon: Mic },
  { id: 'grammar', label: 'Грамматика', icon: BookOpen },
  { id: 'words', label: 'Мини-словарь', icon: Search },
  { id: 'resources', label: 'Ресурсы', icon: ExternalLink },
];

const verbs = [
  ['sein', 'быть'], ['haben', 'иметь'], ['heißen', 'называться'], ['kommen', 'приходить / приезжать'],
  ['wohnen', 'жить'], ['sprechen', 'говорить'], ['lernen', 'учить'], ['arbeiten', 'работать'],
  ['machen', 'делать'], ['gehen', 'идти'], ['fahren', 'ехать'], ['bleiben', 'оставаться'],
  ['essen', 'есть'], ['trinken', 'пить'], ['kaufen', 'покупать'], ['bezahlen', 'платить'],
  ['finden', 'находить'], ['suchen', 'искать'], ['brauchen', 'нуждаться'], ['mögen', 'нравиться'],
  ['möchten', 'хотеть вежливо'], ['können', 'мочь'], ['müssen', 'быть должным'], ['wollen', 'хотеть'],
  ['helfen', 'помогать'], ['treffen', 'встречать(ся)'], ['besuchen', 'посещать'], ['schreiben', 'писать'],
  ['lesen', 'читать'], ['bringen', 'приносить'],
] as const;

const nouns = [
  ['die Familie', 'семья'], ['der Freund', 'друг'], ['die Freundin', 'подруга'], ['das Kind', 'ребёнок'],
  ['die Wohnung', 'квартира'], ['das Zimmer', 'комната'], ['die Stadt', 'город'], ['die Straße', 'улица'],
  ['der Bahnhof', 'вокзал'], ['die Schule', 'школа'], ['die Arbeit', 'работа'], ['der Beruf', 'профессия'],
  ['der Arzt', 'врач'], ['die Apotheke', 'аптека'], ['das Restaurant', 'ресторан'], ['das Hotel', 'гостиница'],
  ['der Supermarkt', 'супермаркет'], ['die Bäckerei', 'пекарня'], ['die Post', 'почта'], ['die Bank', 'банк'],
  ['der Bus', 'автобус'], ['der Zug', 'поезд'], ['das Taxi', 'такси'], ['das Fahrrad', 'велосипед'],
  ['die Fahrkarte', 'билет'], ['das Geld', 'деньги'], ['die Zeit', 'время'], ['die Uhr', 'часы / время'],
  ['das Essen', 'еда'], ['das Wasser', 'вода'], ['das Brot', 'хлеб'], ['das Geschenk', 'подарок'],
] as const;

const questionWords = [
  ['Wer?', 'Кто?'], ['Was?', 'Что?'], ['Wo?', 'Где?'], ['Wohin?', 'Куда?'], ['Woher?', 'Откуда?'],
  ['Wann?', 'Когда?'], ['Wie?', 'Как?'], ['Warum?', 'Почему?'], ['Wie viel?', 'Сколько?'],
  ['Wie lange?', 'Как долго?'], ['Wie alt?', 'Сколько лет?'], ['Welche?', 'Какой / какая / какие?'],
] as const;

const resources = [
  { title: 'Goethe-Institut', description: 'Официальный формат экзамена и пробные материалы.', href: 'https://www.goethe.de/' },
  { title: 'DW Learn German', description: 'Бесплатное аудирование, чтение, лексика и грамматика.', href: 'https://learngerman.dw.com/' },
  { title: 'Easy German', description: 'Живая немецкая речь и субтитры.', href: 'https://www.youtube.com/channel/UCbxb2fqe9oNgglAoYqsYOtQ' },
  { title: 'Anki', description: 'Интервальное повторение слов, артиклей и готовых фраз.', href: 'https://apps.ankiweb.net/' },
  { title: 'Duolingo', description: 'Короткая ежедневная практика лексики и базовой грамматики.', href: 'https://www.duolingo.com/' },
];

export function ExamGuide({ onBack }: ExamGuideProps) {
  const [section, setSection] = useState<Section>('plan');

  return (
    <div className="animate-fade-in pb-8">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={onBack} aria-label="Назад" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <p className="text-sm font-semibold text-teal-700">База подготовки Otto</p>
          <h1 className="text-2xl font-black text-slate-950">Шпаргалки Goethe A1</h1>
          <p className="text-sm text-slate-500">Только то, что помогает на экзамене — без лишней теории</p>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition',
                  section === item.id ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                )}
              >
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
        </div>
      </div>

      {section === 'plan' && <PlanSection />}
      {section === 'schreiben' && <SchreibenSection />}
      {section === 'horen' && <HorenSection />}
      {section === 'sprechen' && <SprechenSection />}
      {section === 'grammar' && <GrammarSection />}
      {section === 'words' && <WordsSection />}
      {section === 'resources' && <ResourcesSection />}
    </div>
  );
}

function PlanSection() {
  return (
    <div className="space-y-5">
      <Hero title="Готовьтесь не «вообще к немецкому», а к конкретным действиям на экзамене" text="Слова → готовые фразы → понимание на слух → говорение и письмо → экзаменационные задания. Регулярность полезнее редких длинных занятий." />

      <div className="grid gap-4 sm:grid-cols-2">
        <GuideCard icon={BookOpen} title="Lesen · около 25 минут" tone="teal">
          <p><b>Teil 1:</b> 2 коротких текста, задания 1–5, Richtig/Falsch.</p>
          <p><b>Teil 2:</b> задания 6–10 — выбрать источник информации a или b.</p>
          <p><b>Teil 3:</b> объявления и вывески, задания 11–15, Richtig/Falsch.</p>
        </GuideCard>
        <GuideCard icon={Headphones} title="Hören · около 20 минут" tone="sky">
          <p><b>Teil 1:</b> a/b/c, запись звучит два раза.</p>
          <p><b>Teil 2:</b> Richtig/Falsch, запись звучит один раз.</p>
          <p><b>Teil 3:</b> a/b/c, запись звучит два раза.</p>
        </GuideCard>
        <GuideCard icon={PenTool} title="Schreiben · около 20 минут" tone="amber">
          <p><b>Teil 1:</b> заполнить 5 пропусков в формуляре.</p>
          <p><b>Teil 2:</b> короткое письмо около 30 слов и три обязательных пункта.</p>
        </GuideCard>
        <GuideCard icon={Mic} title="Sprechen · 3 части" tone="rose">
          <p><b>Teil 1:</b> представиться и назвать/произнести данные.</p>
          <p><b>Teil 2:</b> задать вопрос и ответить.</p>
          <p><b>Teil 3:</b> сформулировать просьбу и отреагировать.</p>
        </GuideCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-black text-slate-950">Простой ежедневный режим</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <TimeBlock time="10–15 мин" title="Слова" text="артикли + готовые сочетания" />
          <TimeBlock time="15–20 мин" title="Hören" text="числа, время, короткие диалоги" />
          <TimeBlock time="20–30 мин" title="Otto" text="одно экзаменационное Teil" />
          <TimeBlock time="5–10 мин" title="Повтор" text="ошибки + фразы для письма/речи" />
        </div>
      </div>
    </div>
  );
}

function SchreibenSection() {
  const phraseGroups = [
    ['Приглашение', ['Vielen Dank für die Einladung.', 'Ich komme gern.', 'Ich kann leider nicht kommen.', 'Ich möchte dich einladen.']],
    ['Курс / информация', ['Wann beginnt der Kurs?', 'Wie viel kostet der Kurs?', 'Ich möchte mich für den Kurs anmelden.', 'Können Sie mir Informationen schicken?']],
    ['Встреча', ['Ich komme am Freitag um 16 Uhr.', 'Wir können uns am Mittwoch um 18 Uhr im Café treffen.', 'Kannst du mich vom Bahnhof abholen?']],
    ['Официально', ['Sehr geehrte Damen und Herren,', 'Ich freue mich auf Ihre Antwort.', 'Vielen Dank im Voraus!', 'Mit freundlichen Grüßen']],
  ] as const;

  return (
    <div className="space-y-5">
      <Hero title="Письмо A1: коротко, понятно, все пункты выполнены" text="Главное не сложность языка, а выполнение задания. Три пункта задания должны получить три понятных ответа." />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-800">Формула письма</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-black text-slate-900">
          {['Обращение', 'Пункт 1', 'Пункт 2', 'Пункт 3', 'Заключение', 'Прощание', 'Имя'].map((item, index, array) => (
            <span key={item} className="contents"><span className="rounded-xl bg-white px-3 py-2 shadow-sm">{item}</span>{index < array.length - 1 && <span className="text-amber-600">→</span>}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GuideCard icon={PenTool} title="Личное письмо" tone="amber">
          <p><b>Liebe Anna, / Lieber Peter,</b></p>
          <p>Три простых предложения по пунктам задания.</p>
          <p>Ich freue mich auf deine Antwort.</p>
          <p><b>Viele Grüße<br />Julia</b></p>
        </GuideCard>
        <GuideCard icon={PenTool} title="Официальное письмо" tone="amber">
          <p><b>Sehr geehrte Damen und Herren,</b></p>
          <p>Три простых предложения или вопроса.</p>
          <p>Ich freue mich auf Ihre Antwort.</p>
          <p><b>Mit freundlichen Grüßen<br />Julia</b></p>
        </GuideCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-black text-slate-950">Фразы, которые реально пригодятся</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {phraseGroups.map(([title, phrases]) => (
            <div key={title} className="rounded-xl bg-slate-50 p-4"><h3 className="text-sm font-black text-slate-900">{title}</h3><div className="mt-2 space-y-2">{phrases.map((phrase) => <p key={phrase} className="text-sm leading-6 text-slate-700">{phrase}</p>)}</div></div>
          ))}
        </div>
      </div>

      <Checklist items={['Есть правильное обращение', 'Раскрыты все 3 пункта', 'Предложения короткие и понятные', 'Проверены глаголы и порядок слов', 'Есть прощание и имя', 'Ориентир — около 30 слов']} />
    </div>
  );
}

function HorenSection() {
  return (
    <div className="space-y-5">
      <Hero title="Hören: не переводите всё — ищите нужную информацию" text="Перед прослушиванием прочитайте вопрос и варианты. Слушайте прежде всего время, дату, число, место, имя, цену, отрицание и изменение планов." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Step number="1" title="До аудио" text="Прочитайте вопрос, варианты и найдите ключевое слово: Wann? Wo? Wie viel? Welche Nummer?" />
        <Step number="2" title="Первое прослушивание" text="Поймите кто говорит, где происходит ситуация и о чём речь. Не цепляйтесь за незнакомые слова." />
        <Step number="3" title="Повтор" text="Если запись звучит второй раз — проверяйте детали: время, дату, число, отрицание, aber / leider." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GuideCard icon={Timer} title="Время — частая ловушка" tone="sky">
          <p>halb neun = <b>8:30</b>, а не 9:30.</p>
          <p>Viertel nach drei = <b>3:15</b>.</p>
          <p>Viertel vor sechs = <b>5:45</b>.</p>
          <p><b>nach</b> — после, <b>vor</b> — до, <b>halb</b> — половина до следующего часа.</p>
        </GuideCard>
        <GuideCard icon={Volume2} title="Слова, которые меняют ответ" tone="sky">
          <p><b>nicht / kein</b> — отрицание.</p>
          <p><b>aber / leider / doch / sondern</b> — после них информация может измениться.</p>
          <p><b>zuerst / dann / endlich</b> — порядок событий.</p>
        </GuideCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-black text-slate-950">Что повторить наизусть</h2>
        <div className="mt-3 flex flex-wrap gap-2">{['дни недели', 'месяцы', 'время', 'даты', 'числа 0–100', 'телефонные номера', 'цены', 'nicht / kein', 'aber / leider'].map((item) => <span key={item} className="rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800">{item}</span>)}</div>
      </div>
    </div>
  );
}

function SprechenSection() {
  return (
    <div className="space-y-5">
      <Hero title="Sprechen: простая правильная фраза лучше сложной" text="Говорите спокойно и чётко. Небольшая пауза и самоисправление нормальны. Главное — продолжать общение." />

      <div className="grid gap-4 sm:grid-cols-3">
        <GuideCard icon={Mic} title="Teil 1 · Sich vorstellen" tone="rose">
          <p>Name → Alter → Land → Wohnort → Sprachen → Beruf → Hobby.</p>
          <p>Guten Tag. Ich heiße …</p><p>Ich bin … Jahre alt.</p><p>Ich wohne in …</p><p>Von Beruf bin ich …</p>
          <p className="font-semibold">Отдельно потренируйте имя, фамилию, город и страну по буквам, телефон и индекс.</p>
        </GuideCard>
        <GuideCard icon={Mic} title="Teil 2 · Frage stellen" tone="rose">
          <p>Используйте вежливое <b>Sie</b>.</p>
          <p>Haben Sie …?</p><p>Wo finde ich …?</p><p>Wie viel kostet …?</p><p>Wann …?</p><p>Mögen Sie …?</p>
        </GuideCard>
        <GuideCard icon={Mic} title="Teil 3 · Bitte" tone="rose">
          <p>Используйте <b>Sie + bitte</b>.</p>
          <p>Geben Sie mir bitte …</p><p>Bringen Sie mir bitte …</p><p>Öffnen Sie bitte …</p><p>Rauchen Sie hier bitte nicht.</p>
          <p>Ответ: Ja, gerne. / Ja, natürlich. / Ja, kein Problem.</p>
        </GuideCard>
      </div>

      <Checklist items={['Говорю достаточно громко и спокойно', 'В Teil 2 и Teil 3 использую Sie', 'В просьбе использую bitte', 'Если забыл слово — заменяю более простым', 'После ошибки продолжаю говорить']} />
    </div>
  );
}

function GrammarSection() {
  return (
    <div className="space-y-5">
      <Hero title="Минимум грамматики, который нужен именно для A1" text="Не нужно знать всю немецкую грамматику. Нужны простые предложения, вопросы, Präsens, sein/haben, модальные глаголы, отрицание и базовые предлоги времени." />

      <div className="grid gap-4 sm:grid-cols-2">
        <Rule title="Утвердительное предложение" formula="Подлежащее + глагол + остальное" example="Max geht nach der Arbeit nach Hause." />
        <Rule title="W-Frage" formula="Вопросительное слово + глагол + подлежащее" example="Wann geht Max nach Hause?" />
        <Rule title="Ja/Nein-Frage" formula="Глагол + подлежащее + остальное" example="Geht Max heute nach Hause?" />
        <Rule title="Модальный глагол" formula="Подлежащее + Modalverb + … + Infinitiv" example="Ich will Deutsch lernen." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <GuideCard icon={BookOpen} title="sein — выучить наизусть" tone="teal"><p>ich <b>bin</b> · du <b>bist</b> · er/sie/es <b>ist</b></p><p>wir <b>sind</b> · ihr <b>seid</b> · sie/Sie <b>sind</b></p></GuideCard>
        <GuideCard icon={BookOpen} title="am · um · im" tone="teal"><p><b>am Montag</b> — день / дата</p><p><b>um 18 Uhr</b> — точное время</p><p><b>im September</b> — месяц / время года</p></GuideCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-black text-slate-950">Готовые опоры</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{['Ich bin …', 'Ich habe …', 'Ich möchte …', 'Ich will …', 'Ich kann …', 'Ich muss …', 'Wann …?', 'Wo …?', 'Warum …?', 'Wie viel …?'].map((item) => <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">{item}</div>)}</div></div>
    </div>
  );
}

function WordsSection() {
  const [query, setQuery] = useState('');
  const all = useMemo(() => [
    ...verbs.map(([de, ru]) => ({ de, ru, group: 'Глаголы' })),
    ...nouns.map(([de, ru]) => ({ de, ru, group: 'Существительные' })),
    ...questionWords.map(([de, ru]) => ({ de, ru, group: 'Вопросы' })),
  ], []);
  const filtered = all.filter((item) => `${item.de} ${item.ru}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));

  return (
    <div className="space-y-5">
      <Hero title="Мини-словарь A1" text="Учите не отдельное слово, а слово вместе с артиклем или готовым сочетанием: der Bahnhof → am Bahnhof; Bus → mit dem Bus; Montag → am Montag." />
      <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur"><div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти слово: Bahnhof, работать, Wann…" className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-teal-400" /></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><div className="grid gap-2 sm:grid-cols-2">{filtered.map((item) => <div key={`${item.group}-${item.de}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"><div><p className="font-bold text-slate-900">{item.de}</p><p className="text-[11px] text-slate-400">{item.group}</p></div><p className="text-right text-sm text-slate-600">{item.ru}</p></div>)}</div>{filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Ничего не найдено.</p>}</div>
    </div>
  );
}

function ResourcesSection() {
  return (
    <div className="space-y-5">
      <Hero title="Дополнительные ресурсы" text="Не нужно заниматься во всех сервисах сразу. Тренажёр нужен для формата экзамена, а внешние ресурсы — для словарного запаса, слуха и регулярности." />
      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((resource) => (
          <a key={resource.title} href={resource.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-950">{resource.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p></div><ExternalLink className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-teal-600" /></div>
          </a>
        ))}
      </div>
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-sm leading-6 text-slate-700"><b className="text-teal-900">Оптимально:</b> 20–30 минут тренажёра Otto + 15–20 минут живого немецкого/аудирования + короткое повторение слов и шаблонов.</div>
    </div>
  );
}

function Hero({ title, text }: { title: string; text: string }) {
  return <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg sm:p-7"><div className="flex items-start gap-3"><Lightbulb className="mt-1 h-6 w-6 shrink-0 text-amber-300" /><div><h2 className="text-xl font-black leading-7">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">{text}</p></div></div></div>;
}

function GuideCard({ icon: Icon, title, tone, children }: { icon: typeof BookOpen; title: string; tone: 'teal' | 'sky' | 'amber' | 'rose'; children: React.ReactNode }) {
  const tones = { teal: 'bg-teal-50 text-teal-700 border-teal-200', sky: 'bg-sky-50 text-sky-700 border-sky-200', amber: 'bg-amber-50 text-amber-700 border-amber-200', rose: 'bg-rose-50 text-rose-700 border-rose-200' };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl border', tones[tone])}><Icon className="h-5 w-5" /></div><h2 className="font-black text-slate-950">{title}</h2><div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">{children}</div></div>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">{number}</div><h3 className="mt-3 font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}

function TimeBlock({ time, title, text }: { time: string; title: string; text: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-black text-teal-700">{time}</p><p className="mt-1 font-black text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div>;
}

function Rule({ title, formula, example }: { title: string; formula: string; example: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-900">{formula}</p><p className="mt-3 font-serif text-[16px] text-slate-700">{example}</p></div>;
}

function Checklist({ items }: { items: string[] }) {
  return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h2 className="font-black text-emerald-900">Проверка перед экзаменом</h2><div className="mt-3 space-y-2">{items.map((item) => <div key={item} className="flex items-start gap-2 text-sm leading-6 text-emerald-900"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></div>)}</div></div>;
}
