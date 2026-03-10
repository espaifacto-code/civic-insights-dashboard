import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { type InteractionAnalysis, type InsightReport } from '@/lib/supabaseApi';
import { mostCommon } from '@/hooks/useDashboardData';

interface Props {
  interactions: InteractionAnalysis[];
  reports: InsightReport[];
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ');
}

export function ExecutiveSummary({ interactions, reports }: Props) {
  if (!interactions.length && !reports.length) {
    return null;
  }

  const topTopic = mostCommon(interactions, (item) => item.main_topic);
  const topBarrier = mostCommon(interactions, (item) => item.barrier_type);
  const topEmotion = mostCommon(interactions, (item) => item.emotion);
  const reviewCount = interactions.filter((item) => item.needs_review).length;
  const totalReports = reports.length;

  const sentences: string[] = [];
  if (topTopic !== '-') sentences.push(`Most interactions relate to <strong>${formatLabel(topTopic)}</strong>.`);
  if (topBarrier !== '-') sentences.push(`<strong>${formatLabel(topBarrier)}</strong> is the dominant barrier.`);
  if (topEmotion !== '-') sentences.push(`<strong>${formatLabel(topEmotion)}</strong> is the clearest emotional signal.`);
  if (reviewCount > 0) sentences.push(`<strong>${reviewCount}</strong> cases require human review.`);
  if (totalReports > 0) sentences.push(`<strong>${totalReports}</strong> insight reports are available.`);

  const summary = sentences.join(' ');
  const chips = [
    topTopic !== '-' ? { label: 'Leading topic', value: formatLabel(topTopic) } : null,
    topBarrier !== '-' ? { label: 'Dominant barrier', value: formatLabel(topBarrier) } : null,
    topEmotion !== '-' ? { label: 'Emotion in focus', value: formatLabel(topEmotion) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/35 shadow-none">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Executive Summary
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">AI-assisted narrative snapshot</span>
        </div>

        <p
          className="mt-4 max-w-4xl text-base leading-8 text-slate-100 md:text-lg"
          dangerouslySetInnerHTML={{ __html: summary }}
        />

        {chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {chips.map((chip) => (
              <div key={chip.label} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                <span className="mr-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">{chip.label}</span>
                <span className="font-medium text-foreground">{chip.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
