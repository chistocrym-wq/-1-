# Otto Lesen — отдельный модуль

Это изолированная копия текущего модуля Lesen из проекта Otto.
Исходная версия: production-коммит c9c7b9132a23d40c7f686661cb436d554455a30b.

## Что внутри

- `src/components/modules/ReadingModule.tsx` — основной экран Lesen: Teil 1, Teil 2, Teil 3, тесты, проверка и результат.
- `src/data/lesen/examSets.ts` — банк заданий Lesen.
- `src/components/common/CompactTranslationEye.tsx` — перевод по кнопке-глазу.
- `src/components/common/HoverTranslateText.tsx` — перевод немецких слов по наведению/нажатию.
- `src/lib/utils.ts` — helper `cn`.
- `netlify/functions/translate-task.js` — API перевода для Netlify.
- `src/index.ts` — короткий экспорт модуля.

## Как подключить в другой проект

Проект должен использовать React + TypeScript + TailwindCSS и пакет `lucide-react`.
В исходном коде используются алиасы вида `@/…`; настройте `@` на папку `src` либо замените импорты на относительные.

Пример:

```tsx
import { ReadingModule } from './src';

<ReadingModule
  onBack={() => setScreen('home')}
  onComplete={(score, total) => {
    console.log('Lesen:', score, total);
  }}
/>
```

`onComplete(score, total)` вызывается после окончания теста.

## Перевод

Компоненты Lesen обращаются к `/api/translate-task`.
Если новый проект тоже размещён на Netlify, скопируйте `netlify/functions/translate-task.js` и настройте переменные окружения `OPENAI_API_KEY` и `OPENAI_BASE_URL`.
Если backend другой — замените URL `/api/translate-task` в двух компонентах перевода на endpoint нового проекта.

## Важно

В эту копию НЕ включены Hören, Schreiben, Sprechen, Premium/оплаты, Telegram и остальные части Otto. Это отдельный переносимый Lesen-модуль.
