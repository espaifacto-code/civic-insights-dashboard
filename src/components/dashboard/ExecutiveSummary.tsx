import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { type InteractionAnalysis, type InsightReport } from '@/lib/supabaseApi';
import { mostCommon } from '@/hooks/useDashboardData';

interface Props {
  interactions: InteractionAnalysis[];
  reports: InsightReport[];
}

export function ExecutiveSummary({ interactions, reports }: Props) {
  if (!interactions.length && !reports.length) {
    return null;
  }

  const topTopic = mostCommon(interactions, (d) => d.main_topic);
  const topBarrier = mostCommon(interactions, (d) => d.barrier_type);
  const topEmotion = mostCommon(interactions, (d) => d.emotion);
  const reviewCount = interactions.filter((d) => d.needs_review).length;
  const totalReports = reports.length;

  const sentences: string[] = [];
  if (topTopic !== '—') sentences.push(`Most interactions relate to **${topTopic.replace(/_/g, ' ')}**.`);
  if (topBarrier !== '—') sentences.push(`**${topBarrier.replace(/_/g, ' ')}** is the dominant barrier.`);
  if (topEmotion !== '—') sentences.push(`**${topEmotion}** is the most common emotional signal.`);
  if (reviewCount > 0) sentences.push(`**${reviewCount}** case${reviewCount > 1 ? 's' : ''} require${reviewCount === 1 ? 's' : ''} human review.`);
  if (totalReports > 0) sentences.push(`**${totalReports}** insight report${totalReports > 1 ? 's' : ''} available.`);

  const summary = sentences.join(' ');

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
        />
      </CardContent>
    </Card>
  );
}
