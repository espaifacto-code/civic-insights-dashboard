import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  accent?: boolean;
  tone?: 'cyan' | 'indigo' | 'violet' | 'amber' | 'rose';
}

const toneStyles = {
  cyan: {
    icon: 'text-cyan-200',
    iconWrap: 'border-cyan-300/20 bg-cyan-300/10',
    glow: 'from-cyan-400/20',
    value: 'text-cyan-100',
  },
  indigo: {
    icon: 'text-indigo-200',
    iconWrap: 'border-indigo-300/20 bg-indigo-300/10',
    glow: 'from-indigo-400/20',
    value: 'text-indigo-100',
  },
  violet: {
    icon: 'text-violet-200',
    iconWrap: 'border-violet-300/20 bg-violet-300/10',
    glow: 'from-violet-400/20',
    value: 'text-violet-100',
  },
  amber: {
    icon: 'text-amber-200',
    iconWrap: 'border-amber-300/20 bg-amber-300/10',
    glow: 'from-amber-400/20',
    value: 'text-amber-100',
  },
  rose: {
    icon: 'text-rose-200',
    iconWrap: 'border-rose-300/20 bg-rose-300/10',
    glow: 'from-rose-400/20',
    value: 'text-rose-100',
  },
};

export function KPICard({ title, value, icon: Icon, subtitle, accent, tone = 'cyan' }: KPICardProps) {
  const palette = toneStyles[tone];

  return (
    <Card className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${palette.glow} via-transparent to-transparent opacity-80`} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <p className={`text-3xl font-semibold tracking-tight ${accent ? palette.value : 'text-foreground'}`}>{value}</p>
              {subtitle && <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">{subtitle}</p>}
            </div>
          </div>

          <div className={`rounded-2xl border p-3 ${palette.iconWrap}`}>
            <Icon className={`h-5 w-5 ${palette.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
