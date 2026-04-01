import { motion } from 'motion/react';
import { Music2, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { FeatureCard } from '../components/FeatureCard';
import { SoundWaveVisualization } from '../components/SoundWaveVisualization';
import logo from '../../imports/LogoWhite.svg';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <SoundWaveVisualization />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex flex-col items-center gap-4"
          >
            <img src={logo} alt="Statify Logo" className="h-20 md:h-28 w-auto" />
            <h1 className="text-5xl md:text-7xl mb-2 tracking-tight">
              <span className="font-bold">Statify</span>
            </h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 text-4xl tracking-tight md:text-6xl"
          >
            Your music, analyzed. <span className="text-[#1db954]">Always.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mb-12 max-w-2xl text-lg text-gray-400 md:text-xl"
          >
            Turn your listening history into a continuous, interactive story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <button
              onClick={() => navigate('/auth')}
              className="rounded-full bg-[#1db954] px-12 py-5 text-lg shadow-2xl shadow-[#1db954]/50 transition-all hover:scale-105 hover:bg-[#1ed760]"
            >
              <span className="flex items-center gap-3">
                <Music2 className="size-6" />
                Connect with Spotify
              </span>
            </button>
            <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto text-decoration: underline"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/auth')}
          >
            Log In
          </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 md:flex-row"
          >
            <FeatureCard icon={Music2} title="Top Artists" />
            <FeatureCard icon={TrendingUp} title="Listening Trends" />
            <FeatureCard icon={Sparkles} title="Personalized Insights" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
