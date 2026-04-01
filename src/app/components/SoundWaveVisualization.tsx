import { motion } from 'motion/react';
import { useState } from 'react';

interface WaveBar {
  id: number;
  heights: [number, number, number];
  duration: number;
}

export function SoundWaveVisualization() {
  const [bars] = useState<WaveBar[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      heights: [
        Math.random() * 150 + 100,
        Math.random() * 280 + 120,
        Math.random() * 150 + 100,
      ],
      duration: 1.5 + Math.random(),
    }))
  );
  
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-60">
      <div className="flex items-center gap-1 h-96">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            className="w-2 bg-gradient-to-t from-[#1db954] to-[#1ed760] rounded-full"
            animate={{
              height: bar.heights,
            }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bar.id * 0.02,
            }}
          />
        ))}
      </div>
    </div>
  );
}
