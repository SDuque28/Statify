import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
}

export function FeatureCard({ icon: Icon, title }: FeatureCardProps) {
  return (
    <div className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-sm transition-colors hover:bg-white/10 sm:justify-start sm:px-6">
      <div className="rounded-lg bg-[#1db954]/20 p-2">
        <Icon className="size-5 text-[#1db954]" />
      </div>
      <span className="text-sm text-gray-300">{title}</span>
    </div>
  );
}
