import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
}

export function FeatureCard({ icon: Icon, title }: FeatureCardProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="p-2 bg-[#1db954]/20 rounded-lg">
        <Icon className="size-5 text-[#1db954]" />
      </div>
      <span className="text-sm text-gray-300">{title}</span>
    </div>
  );
}
