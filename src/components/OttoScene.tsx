export type OttoSceneName = 'home' | 'guide' | 'lesen' | 'horen' | 'schreiben' | 'exam';

interface OttoSceneProps {
  scene: OttoSceneName;
  className?: string;
  label?: string;
}

export function OttoScene({ scene, className = '', label = '' }: OttoSceneProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`otto-scene otto-scene-${scene} ${className}`.trim()}
    />
  );
}
