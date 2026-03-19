import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  emoji: string;
}

interface Props {
  /** Trigger a burst at this key changing (increment to trigger) */
  trigger: number;
  /** Center X percent */
  x?: number;
  /** Center Y percent */
  y?: number;
  /** Type of particle burst */
  type?: 'gold' | 'death';
}

const COIN_EMOJIS = ['🪙', '✨', '💰'];
const DEATH_EMOJIS = ['💀', '💥', '✨', '⭐'];

export function Particles({ trigger, x = 50, y = 40, type = 'gold' }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const emojis = type === 'gold' ? COIN_EMOJIS : DEATH_EMOJIS;
    const count = type === 'gold' ? 6 : 8;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: trigger * 100 + i,
        x,
        y,
        angle: (360 / count) * i + (Math.random() - 0.5) * 40,
        speed: 30 + Math.random() * 40,
        size: 10 + Math.random() * 6,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 700);
    return () => clearTimeout(timer);
  }, [trigger, x, y, type]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.speed;
        const ty = Math.sin(rad) * p.speed - 20; // bias upward
        return (
          <div
            key={p.id}
            className="absolute animate-particle-burst"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        );
      })}
    </div>
  );
}
