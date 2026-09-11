import type { SpeakingVisual } from '@/data/speaking';

interface SpeakingCardIllustrationProps {
  visual: SpeakingVisual;
  alt: string;
}

export function SpeakingCardIllustration({ visual, alt }: SpeakingCardIllustrationProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label={alt}
      className="h-40 w-full text-slate-800 sm:h-44"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="8" width="224" height="144" rx="18" className="fill-slate-50 stroke-slate-200" />
      {renderVisual(visual)}
    </svg>
  );
}

function renderVisual(visual: SpeakingVisual) {
  switch (visual) {
    case 'water':
      return (
        <g>
          <path d="M82 48h76l-8 78H90z" />
          <path d="M91 85c19 8 39-8 58 0" className="stroke-sky-500" />
          <path d="M96 104c15 5 32-6 49 0" className="stroke-sky-500" />
        </g>
      );
    case 'pen':
      return (
        <g>
          <path d="M63 112l18-7 91-65 13 18-91 65-19 2z" />
          <path d="M161 48l13 18" />
          <path d="M74 125l7-20" />
        </g>
      );
    case 'window':
      return (
        <g>
          <rect x="65" y="35" width="110" height="90" rx="3" />
          <path d="M120 35v90M65 80h110" />
          <path d="M76 112l30-25M134 67l29-20" className="stroke-sky-500" />
        </g>
      );
    case 'door':
      return (
        <g>
          <path d="M80 130V30h82v100" />
          <path d="M93 130V42h56v88" />
          <circle cx="137" cy="86" r="4" className="fill-slate-800" />
        </g>
      );
    case 'salt':
      return (
        <g>
          <path d="M92 64h56l8 62H84z" />
          <path d="M99 48h42l7 16H92z" />
          <circle cx="108" cy="56" r="2" className="fill-slate-800" />
          <circle cx="120" cy="54" r="2" className="fill-slate-800" />
          <circle cx="132" cy="56" r="2" className="fill-slate-800" />
          <text x="102" y="103" fontSize="18" stroke="none" fill="currentColor" fontWeight="700">SALZ</text>
        </g>
      );
    case 'menu':
      return (
        <g>
          <rect x="67" y="30" width="106" height="100" rx="7" />
          <path d="M91 58h58M91 76h58M91 94h42M91 112h50" />
          <text x="92" y="50" fontSize="12" stroke="none" fill="currentColor" fontWeight="700">MENÜ</text>
        </g>
      );
    case 'phone':
      return (
        <g>
          <rect x="86" y="27" width="68" height="108" rx="12" />
          <path d="M100 44h40" />
          <circle cx="120" cy="119" r="5" />
          <path d="M106 69c8-8 20-8 28 0M112 79c5-5 11-5 16 0" className="stroke-sky-500" />
        </g>
      );
    case 'key':
      return (
        <g>
          <circle cx="86" cy="78" r="24" />
          <path d="M108 78h71M157 78v17M173 78v12" />
          <circle cx="86" cy="78" r="8" />
        </g>
      );
    case 'bag':
      return (
        <g>
          <path d="M67 62h106l-9 67H76z" />
          <path d="M92 64c0-22 56-22 56 0" />
          <path d="M87 88h66" />
        </g>
      );
    case 'ticket':
      return (
        <g>
          <path d="M55 52h130v58c-10 0-10 20 0 20H55c10 0 10-20 0-20z" />
          <path d="M91 55v72" strokeDasharray="6 7" />
          <text x="105" y="84" fontSize="14" stroke="none" fill="currentColor" fontWeight="700">FAHRKARTE</text>
          <text x="111" y="104" fontSize="12" stroke="none" fill="currentColor">KÖLN</text>
        </g>
      );
    case 'map':
      return (
        <g>
          <path d="M55 45l43-13 44 13 43-13v84l-43 13-44-13-43 13z" />
          <path d="M98 32v84M142 45v84" />
          <path d="M70 96c25-9 34-30 54-20s24-10 44-20" className="stroke-sky-500" />
          <circle cx="128" cy="75" r="6" className="fill-amber-400 stroke-amber-500" />
        </g>
      );
    case 'umbrella':
      return (
        <g>
          <path d="M50 82c9-50 131-50 140 0-13-10-25-10-38 0-11-10-22-10-32 0-10-10-21-10-32 0-13-10-25-10-38 0z" />
          <path d="M120 48v72c0 18 27 18 27 0" />
        </g>
      );
    case 'bread':
      return (
        <g>
          <path d="M62 101c0-37 24-61 58-61s58 24 58 61v24H62z" />
          <path d="M92 59l13 16M120 48l13 17M147 59l12 16" />
        </g>
      );
    case 'bottle':
      return (
        <g>
          <path d="M105 32h30v25l10 16v55H95V73l10-16z" />
          <path d="M104 43h32M96 88h48" />
          <path d="M106 103h28" className="stroke-sky-500" />
        </g>
      );
    case 'chair':
      return (
        <g>
          <path d="M78 42h84v54H78zM72 96h96v18H72zM82 114v20M158 114v20" />
        </g>
      );
    case 'light':
      return (
        <g>
          <path d="M88 74c0-19 14-34 32-34s32 15 32 34c0 12-6 22-16 29v13h-32v-13c-10-7-16-17-16-29z" />
          <path d="M104 128h32M120 22v-9M74 35l-8-8M166 35l8-8M67 78H54M186 78h-13" className="stroke-amber-500" />
        </g>
      );
    case 'photo':
      return (
        <g>
          <rect x="58" y="53" width="124" height="76" rx="10" />
          <path d="M91 53l9-18h40l9 18" />
          <circle cx="120" cy="91" r="23" />
          <circle cx="120" cy="91" r="11" className="stroke-sky-500" />
          <circle cx="162" cy="69" r="4" className="fill-slate-800" />
        </g>
      );
    case 'suitcase':
      return (
        <g>
          <rect x="60" y="57" width="120" height="72" rx="10" />
          <path d="M96 57V43h48v14M81 57v72M159 57v72M93 87h54" />
          <circle cx="84" cy="136" r="5" className="fill-slate-800" />
          <circle cx="156" cy="136" r="5" className="fill-slate-800" />
        </g>
      );
  }
}
