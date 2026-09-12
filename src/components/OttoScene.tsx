export type OttoSceneName = 'home' | 'guide' | 'lesen' | 'horen' | 'schreiben' | 'exam';

interface OttoSceneProps {
  scene: OttoSceneName;
  className?: string;
  label?: string;
}

export function OttoScene({ scene, className = '', label = '' }: OttoSceneProps) {
  if (scene === 'home') {
    return (
      <img
        src="/otto-full-transparent.png?v=18"
        alt={label}
        aria-hidden={label ? undefined : true}
        className={`otto-scene-image otto-scene-home ${className}`.trim()}
        draggable={false}
      />
    );
  }

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`otto-scene otto-scene-${scene} ${className}`.trim()}
    />
  );
}
