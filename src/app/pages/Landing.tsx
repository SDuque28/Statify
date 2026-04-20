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
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <SoundWaveVisualization />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]" />

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex flex-col items-center gap-3 sm:mb-8 sm:gap-4"
          >
            <img src={logo} alt="Statify Logo" className="h-16 w-auto sm:h-20 md:h-28" />
            <h1 className="mb-2 text-5xl tracking-tight sm:text-6xl md:text-8xl">
              <span className="font-bold">Statify</span>
            </h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-5 text-3xl tracking-tight sm:text-4xl md:mb-6 md:text-6xl"
          >
            Your music, analyzed. <span className="text-[#1db954]">Always.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mb-10 max-w-2xl text-base text-gray-400 sm:text-lg md:mb-12 md:text-xl"
          >
            Turn your listening history into a continuous, interactive story.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
              className="w-full rounded-full bg-[#1db954] px-8 py-4 text-base shadow-2xl shadow-[#1db954]/50 transition-all hover:scale-105 hover:bg-[#1ed760] sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
            >
              <span className="flex items-center justify-center gap-3">
                <Music2 className="size-5 sm:size-6" />
                Connect with Spotify
              </span>
            </button>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.04,
                color: '#ffffff',
                textShadow:
                  '0 0 10px rgba(29, 185, 84, 0.85), 0 0 22px rgba(29, 185, 84, 0.55)',
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl cursor-pointer text-base text-gray-400 underline underline-offset-4 sm:text-lg md:text-xl"
              onClick={() => navigate('/auth', { state: { tab: 'login' } })}
            >
              Log In
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4"
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
