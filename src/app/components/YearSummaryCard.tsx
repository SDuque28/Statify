import { Calendar, Music, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export function YearSummaryCard() {
  const monthlyData = [
    { month: 'Jan', minutes: 4200 },
    { month: 'Feb', minutes: 5100 },
    { month: 'Mar', minutes: 4800 },
    { month: 'Apr', minutes: 5600 },
    { month: 'May', minutes: 6200 },
    { month: 'Jun', minutes: 5800 },
    { month: 'Jul', minutes: 6400 },
    { month: 'Aug', minutes: 5900 },
    { month: 'Sep', minutes: 6100 },
    { month: 'Oct', minutes: 6800 },
    { month: 'Nov', minutes: 7200 },
    { month: 'Dec', minutes: 5432 },
  ];

  const stats = [
    { icon: Calendar, label: 'Minutes Listened', value: '65,432' },
    { icon: Music, label: 'Top Genre', value: 'Rock' },
    { icon: TrendingUp, label: 'Total Tracks', value: '2,847' },
  ];

  return (
    <div className="relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-gradient-to-br from-[#1db954]/20 via-[var(--card-bg)] to-[var(--card-bg)] p-8">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, #1db954 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, #1ed760 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, #1db954 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="mb-2 text-3xl text-[var(--text-primary)]">My Year in Music</h2>
          <p className="text-[var(--text-secondary)]">2026 Listening Statistics</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-[var(--border-color)] bg-black/30 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-[#1db954]/20 p-2">
                  <stat.icon className="size-5 text-[#1db954]" />
                </div>
                <div>
                  <p className="mb-1 text-sm text-[var(--text-secondary)]">{stat.label}</p>
                  <p className="text-2xl text-[var(--text-primary)]">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="h-48 rounded-lg border border-[var(--border-color)] bg-black/30 p-4 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} className="w-full">
              <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#1db954"
                strokeWidth={3}
                dot={{ fill: '#1db954', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
