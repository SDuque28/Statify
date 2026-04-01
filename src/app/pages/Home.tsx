import { Clock3, Sparkles, TrendingUp } from 'lucide-react';

const cards = [
  { title: 'Listening streak', value: '18 days', icon: Clock3 },
  { title: 'Top growth genre', value: 'Alt-pop', icon: TrendingUp },
  { title: 'Mood insight', value: 'Late-night energy', icon: Sparkles },
];

export function Home() {
  return (
    <section className="space-y-8">
      <div>
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#1db954]">Overview</p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome back to Statify</h1>
        <p className="mt-3 max-w-2xl text-gray-400">
          This starter dashboard gives your current routes a working destination while you
          build the real analytics experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <article
            key={title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-[#1db954]/15 p-3">
              <Icon className="size-5 text-[#1db954]" />
            </div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
