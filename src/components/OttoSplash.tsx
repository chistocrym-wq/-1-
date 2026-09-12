import { useEffect, useState } from 'react';

const PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  top: 18 + ((i * 53) % 62),
  dx: ((i % 9) - 4) * 16,
  dy: -52 - ((i * 13) % 92),
  delay: (i % 10) * 24,
}));

export function OttoSplash() {
  const [active, setActive] = useState(true);
  const [visible, setVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    const reveal = window.setTimeout(() => setVisible(true), 2600);
    const dissolve = window.setTimeout(() => setDissolving(true), 6600);
    const finish = window.setTimeout(() => setActive(false), 8000);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(dissolve);
      window.clearTimeout(finish);
    };
  }, []);

  if (!active) return null;

  return (
    <div className={`otto-splash-screen ${dissolving ? 'is-dissolving' : ''}`} aria-hidden="true">
      <div className="otto-splash-glow" />
      <img
        src="/otto-full-transparent.png"
        alt=""
        className={`otto-splash-figure ${visible ? 'is-visible' : ''}`}
        draggable={false}
      />
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
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
