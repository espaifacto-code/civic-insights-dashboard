import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Heart, ShieldAlert, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { type InteractionAnalysis } from '@/lib/supabaseApi';
import { countBy, mostCommon } from '@/hooks/useDashboardData';

interface Props {
  interactions: InteractionAnalysis[];
}

interface AlertItem {
  title: string;
  detail: string;
  icon: LucideIcon;
  severity: 'warning' | 'info' | 'critical';
}

const severityStyles = {
  critical: {
    wrapper: 'border-rose-300/20 bg-rose-400/10',
    icon: 'bg-rose-400/15 text-rose-100',
    eyebrow: 'text-rose-200',
  },
  warning: {
    wrapper: 'border-amber-300/20 bg-amber-400/10',
    icon: 'bg-amber-400/15 text-amber-100',
    eyebrow: 'text-amber-200',
  },
  info: {
    wrapper: 'border-indigo-300/20 bg-indigo-400/10',
    icon: 'bg-indigo-400/15 text-indigo-100',
    eyebrow: 'text-indigo-200',
  },
};

function formatLabel(value: string) {
  return value.replace(/_/g, ' ');
}

export function AlertsPanel({ interactions }: Props) {
  if (!interactions.length) {
    return (
      <Card className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">System Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  const alerts: AlertItem[] = [];

  const topBarrier = mostCommon(interactions, (item) => item.barrier_type);
  const topTopic = mostCommon(interactions, (item) => item.main_topic);
  const topEmotion = mostCommon(interactions, (item) => item.emotion);
  const reviewCount = interactions.filter((item) => item.needs_review).length;
  const highUrgency = interactions.filter((item) => item.urgency === 'high' || item.urgency === 'critical').length;

  if (highUrgency > 0) {
    alerts.push({
      title: 'High urgency cases detected',
      detail: `${highUrgency} interactions are marked as high or critical urgency and should be reviewed first.`,
      icon: AlertTriangle,
      severity: 'critical',
    });
  }

  if (topBarrier !== '-') {
    alerts.push({
      title: `${formatLabel(topBarrier)} barrier is significant`,
      detail: `Barrier pressure remains concentrated around ${formatLabel(topBarrier)} in the current interaction set.`,
      icon: ShieldAlert,
      severity: 'warning',
    });
  }

  if (topTopic !== '-') {
    alerts.push({
      title: `${formatLabel(topTopic)} is the most frequent issue`,
      detail: `This topic leads the interaction flow and should anchor intervention prioritisation.`,
      icon: TrendingUp,
      severity: 'info',
    });
  }

  if (topEmotion !== '-') {
    alerts.push({
      title: `${formatLabel(topEmotion)} is the dominant emotional signal`,
      detail: `Emotional tone suggests support teams should adjust tone and escalation scripts accordingly.`,
      icon: Heart,
      severity: 'info',
    });
  }

  if (reviewCount > 0) {
    alerts.push({
      title: 'Cases needing review elevated',
      detail: `${reviewCount} interactions were routed for human follow-up in the active dataset.`,
      icon: Users,
      severity: 'warning',
    });
  }

  const sorted = [...interactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);
  const barriersFirst = countBy(firstHalf, (item) => item.barrier_type);
  const barriersSecond = countBy(secondHalf, (item) => item.barrier_type);

  for (const barrier of barriersSecond) {
    const previous = barriersFirst.find((entry) => entry.name === barrier.name);
    if (previous && barrier.count > previous.count * 1.3) {
      alerts.push({
        title: `${formatLabel(barrier.name)} cases are increasing`,
        detail: `The second half of the period shows a meaningful rise versus the first half.`,
        icon: TrendingUp,
        severity: 'warning',
      });
      break;
    }
  }

  return (
    <Card className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-100">
          <AlertTriangle className="h-3.5 w-3.5" />
          Signal Watch
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">System Signals</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Live flags synthesized from urgency, review need, topic concentration, and barrier movement.</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const style = severityStyles[alert.severity];

          return (
            <div key={`${alert.title}-${alert.detail}`} className={`rounded-[24px] border p-4 ${style.wrapper}`}>
              <div className="flex items-start gap-4">
                <div className={`rounded-2xl p-3 ${style.icon}`}>
                  <alert.icon className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${style.eyebrow}`}>{alert.severity}</p>
                  <h3 className="text-base font-semibold text-foreground">{alert.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
