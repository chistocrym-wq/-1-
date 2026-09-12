import { useEffect, useState, type CSSProperties } from 'react';
import { OttoScene } from '@/components/OttoScene';

const PARTICLES = Array.from({ length: 72 }, (_, i) => ({
  left: 14 + ((i * 37) % 72),
  top: 14 + ((i * 53) % 70),
  dx: ((i % 11) - 5) * 18,
  dy: -52 - ((i * 13) % 124),
  delay: (i % 12) * 20,
}));

export function OttoSplash() {
  const [active, setActive] = useState(true);
  const [visible, setVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    const reveal = window.setTimeout(() => setVisible(true), 3000);
    const dissolve = window.setTimeout(() => setDissolving(true), 6500);
    const finish = window.setTimeout(() => setActive(false), 7900);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(dissolve);
      window.clearTimeout(finish);
    };
  }, []);

  if (!active) return null;

  return (
    <div className={`otto-splash-screen ${dissolving ? 'is-dissolving' : ''}`} aria-hidden="true">
      <div className={`otto-splash-figure ${visible ? 'is-visible' : ''}`}>
        <OttoScene scene="home" className="otto-splash-otto" />
      </div>
      <div className="otto-splash-particles">
        {PARTICLES.map((p, i) => (
          <i
            key={i}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--delay': `${p.delay}ms`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
