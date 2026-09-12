import { useEffect, useRef, useState } from 'react';

const PARTICLES = Array.from({ length: 56 }, (_, i) => ({
  left: 18 + ((i * 37) % 64),
  top: 18 + ((i * 53) % 62),
  dx: ((i % 9) - 4) * 18,
  dy: -58 - ((i * 13) % 108),
  delay: (i % 10) * 24,
}));

export function OttoSplash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dissolving, setDissolving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new Image();
    image.decoding = 'async';
    image.src = '/otto.png?v=12';

    image.onload = () => {
      const size = 900;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (size - width) / 2;
      const y = (size - height) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(image, x, y, width, height);

      try {
        const frame = ctx.getImageData(0, 0, size, size);
        const data = frame.data;
        const total = size * size;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let head = 0;
        let tail = 0;

        const isBackground = (pixel: number) => {
          const p = pixel * 4;
          const a = data[p + 3];
          if (a < 20) return true;
          const r = data[p];
          const g = data[p + 1];
          const b = data[p + 2];
          return r < 82 && g < 82 && b < 82 && Math.max(r, g, b) - Math.min(r, g, b) < 22;
        };

        const push = (pixel: number) => {
          if (pixel < 0 || pixel >= total || visited[pixel] || !isBackground(pixel)) return;
          visited[pixel] = 1;
          queue[tail++] = pixel;
        };

        for (let px = 0; px < size; px += 1) {
          push(px);
          push((size - 1) * size + px);
        }
        for (let py = 0; py < size; py += 1) {
          push(py * size);
          push(py * size + size - 1);
        }

        while (head < tail) {
          const pixel = queue[head++];
          const px = pixel % size;
          const py = Math.floor(pixel / size);
          data[pixel * 4 + 3] = 0;
          if (px > 0) push(pixel - 1);
          if (px < size - 1) push(pixel + 1);
          if (py > 0) push(pixel - size);
          if (py < size - 1) push(pixel + size);
        }

        ctx.putImageData(frame, 0, 0);
      } catch {
        // Keep Otto visible even if pixel processing is unavailable.
      }

      setReady(true);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const reveal = window.setTimeout(() => setVisible(true), 2800);
    const dissolve = window.setTimeout(() => setDissolving(true), 6500);
    const finish = window.setTimeout(() => setActive(false), 8000);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(dissolve);
      window.clearTimeout(finish);
    };
  }, [ready]);

  if (!active) return null;

  return (
    <div className={`otto-splash-screen ${dissolving ? 'is-dissolving' : ''}`} aria-hidden="true">
      <div className="otto-splash-glow" />
      <canvas
        ref={canvasRef}
        className={`otto-splash-figure ${visible ? 'is-visible' : ''}`}
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
