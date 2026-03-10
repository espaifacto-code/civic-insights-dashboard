import { useQuery } from '@tanstack/react-query';
import { fetchInteractionAnalysis, type InteractionAnalysis } from '@/lib/supabaseApi';
import { format } from 'date-fns';

function countBy(items: InteractionAnalysis[], key: keyof InteractionAnalysis) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = item[key];
    if (val && typeof val === 'string' && val.trim() !== '') {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function useInsightsData() {
  return useQuery({
    queryKey: ['interaction-analysis'],
    queryFn: fetchInteractionAnalysis,
    select: (data) => {
      // Cases over time (grouped by date)
      const dateMap: Record<string, number> = {};
      for (const row of data) {
        const day = format(new Date(row.created_at), 'MMM dd');
        dateMap[day] = (dateMap[day] || 0) + 1;
      }
      const casesOverTime = Object.entries(dateMap).map(([date, cases]) => ({ date, cases }));

      return {
        totalCases: data.length,
        needsReview: data.filter((d) => d.needs_review).length,
        casesOverTime,
        topBarriers: countBy(data, 'barrier_type'),
        emotions: countBy(data, 'emotion'),
        topTopics: countBy(data, 'main_topic'),
      };
    },
  });
}
