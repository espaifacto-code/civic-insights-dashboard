import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Heart, ShieldAlert, Users } from 'lucide-react';
import { type InteractionAnalysis } from '@/lib/supabaseApi';
import { countBy, mostCommon } from '@/hooks/useDashboardData';
import { type LucideIcon } from 'lucide-react';

interface Props {
  interactions: InteractionAnalysis[];
}

interface Alert {
  message: string;
  icon: LucideIcon;
  severity: 'warning' | 'info' | 'critical';
}

export function AlertsPanel({ interactions }: Props) {
  if (!interactions.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">System Signals</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No data available</p></CardContent>
      </Card>
    );
  }

  const alerts: Alert[] = [];

  const topBarrier = mostCommon(interactions, (d) => d.barrier_type);
  const topTopic = mostCommon(interactions, (d) => d.main_topic);
  const topEmotion = mostCommon(interactions, (d) => d.emotion);
  const reviewCount = interactions.filter((d) => d.needs_review).length;
  const highUrgency = interactions.filter((d) => d.urgency === 'high' || d.urgency === 'critical').length;

  if (topBarrier !== '—') {
    alerts.push({ message: `${topBarrier.replace(/_/g, ' ')} is the most frequent barrier`, icon: ShieldAlert, severity: 'warning' });
  }
  if (topTopic !== '—') {
    alerts.push({ message: `${topTopic.replace(/_/g, ' ')} is the most frequent issue`, icon: TrendingUp, severity: 'info' });
  }
  if (topEmotion !== '—') {
    alerts.push({ message: `${topEmotion} is the dominant emotional signal`, icon: Heart, severity: 'info' });
  }
  if (highUrgency > 0) {
    alerts.push({ message: `${highUrgency} high urgency case${highUrgency > 1 ? 's' : ''} detected`, icon: AlertTriangle, severity: 'critical' });
  }
  if (reviewCount > 0) {
    alerts.push({ message: `${reviewCount} case${reviewCount > 1 ? 's' : ''} needing human review`, icon: Users, severity: 'warning' });
  }

  // Check if any barrier is increasing over time
  const sorted = [...interactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);
  const barriersFirst = countBy(firstHalf, (d) => d.barrier_type);
  const barriersSecond = countBy(secondHalf, (d) => d.barrier_type);
  for (const b of barriersSecond) {
    const prev = barriersFirst.find((x) => x.name === b.name);
    if (prev && b.count > prev.count * 1.3) {
      alerts.push({ message: `${b.name.replace(/_/g, ' ')} cases are increasing`, icon: TrendingUp, severity: 'warning' });
      break;
    }
  }

  const severityColors = {
    critical: 'border-l-destructive bg-destructive/5',
    warning: 'border-l-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5',
    info: 'border-l-primary bg-primary/5',
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
          System Signals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-md border-l-4 p-3 ${severityColors[alert.severity]}`}>
            <alert.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm text-foreground">{alert.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
