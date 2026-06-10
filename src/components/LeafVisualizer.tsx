import { motion } from 'framer-motion';

interface LeafVisualizerProps {
  unfurling: number;
}

export function LeafVisualizer({ unfurling }: LeafVisualizerProps) {
  const stage = unfurling < 0.25 ? 1 : unfurling < 0.5 ? 2 : unfurling < 0.75 ? 3 : 4;

  const leafPaths = [
    // Stage 1: tightly rolled
    <g key="1" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="12" opacity={0.8} />
      <path d="M50 38 Q55 30 60 38" opacity={0.6} />
      <path d="M50 62 Q45 70 40 62" opacity={0.6} />
    </g>,
    // Stage 2: initial swelling
    <g key="2" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="50" cy="50" rx="18" ry="14" opacity={0.8} />
      <path d="M50 36 Q58 28 66 36" opacity={0.6} />
      <path d="M50 64 Q42 72 34 64" opacity={0.6} />
    </g>,
    // Stage 3: expanding
    <g key="3" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="50" cy="50" rx="26" ry="18" opacity={0.9} />
      <path d="M24 50 Q50 30 76 50" opacity={0.5} />
      <path d="M24 50 Q50 70 76 50" opacity={0.5} />
      <line x1="50" y1="32" x2="50" y2="68" opacity={0.7} />
    </g>,
    // Stage 4: fully unfurled
    <g key="4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 50 Q35 20 50 20 Q65 20 80 50 Q65 80 50 80 Q35 80 20 50Z" opacity={0.95} />
      <path d="M20 50 Q50 40 80 50" opacity={0.4} />
      <path d="M20 50 Q50 60 80 50" opacity={0.4} />
      <line x1="50" y1="20" x2="50" y2="80" opacity={0.8} />
      <line x1="50" y1="80" x2="50" y2="92" opacity={0.6} />
    </g>,
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.svg
        viewBox="0 0 100 100"
        className="w-32 h-32 text-tea-green"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {leafPaths[stage - 1]}
      </motion.svg>
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Unfurling</div>
        <div className="text-xs font-mono">{(unfurling * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
}
