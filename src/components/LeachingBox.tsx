import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface LeachingBoxProps {
  level: number;
  velocity: number;
}

export function LeachingBox({ level, velocity }: LeachingBoxProps) {
  const particles = useMemo(() => {
    const count = Math.min(80, Math.max(5, Math.round(level * 1.6)));
    const speedFactor = Math.min(2.0, Math.max(0.3, velocity * 0.05));
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() * 2 - 1) * speedFactor,
        vy: (Math.random() * 2 - 1) * speedFactor,
      });
    }
    return arr;
  }, [Math.round(level / 5), velocity]);

  const shade = velocity > 0.6 ? 'bg-emerald-400' : velocity > 0.3 ? 'bg-emerald-500/70' : level > 60 ? 'bg-emerald-600/50' : level > 20 ? 'bg-emerald-700/30' : level > 3 ? 'bg-emerald-600/40' : level > 1 ? 'bg-emerald-700/30' : 'bg-emerald-800/20';

  return (
    <div className="relative w-full aspect-video glass rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs text-slate-500 uppercase tracking-wider">Leaching Simulation</div>
      </div>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute w-1.5 h-1.5 rounded-full ${shade}`}
          initial={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            left: [`${p.x}%`, `${clamp(p.x + p.vx * 20)}%`, `${p.x}%`],
            top: [`${p.y}%`, `${clamp(p.y + p.vy * 20)}%`, `${p.y}%`],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function clamp(v: number): number {
  return Math.max(5, Math.min(95, v));
}
