export type OttoSceneName = 'home' | 'guide' | 'lesen' | 'horen' | 'schreiben' | 'exam';

interface OttoSceneProps {
  scene: OttoSceneName;
  className?: string;
  label?: string;
}

const sceneSrc: Record<OttoSceneName, string> = {
  home: '/otto-direct/home.webp?v=19',
  guide: '/otto-direct/guide.webp?v=19',
  lesen: '/otto-direct/lesen.webp?v=19',
  horen: '/otto-direct/horen.webp?v=19',
  schreiben: '/otto-direct/schreiben.webp?v=19',
  exam: '/otto-direct/exam.webp?v=19',
};

export function OttoScene({ scene, className = '', label = '' }: OttoSceneProps) {
  return (
    <img
      src={sceneSrc[scene]}
      alt={label}
      aria-hidden={label ? undefined : true}
      className={`otto-scene-image otto-scene-${scene} ${className}`.trim()}
      draggable={false}
    />
  );
}
