import { useQuery } from '@tanstack/react-query';
import { fetchInteractionAnalysis, fetchInsightReports, type InteractionAnalysis, type InsightReport } from '@/lib/supabaseApi';
import { useMemo, useState } from 'react';

export interface Filters {
  dateFrom: string;
  dateTo: string;
  topic: string;
  barrier: string;
  emotion: string;
  urgency: string;
  needsReview: string; // 'all' | 'true' | 'false'
}

const defaultFilters: Filters = {
  dateFrom: '',
  dateTo: '',
  topic: '',
  barrier: '',
  emotion: '',
  urgency: '',
  needsReview: 'all',
};

export function countBy<T>(items: T[], keyFn: (item: T) => string | null | undefined) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = keyFn(item);
    if (val && val.trim() !== '') {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function mostCommon<T>(items: T[], keyFn: (item: T) => string | null | undefined): string {
  const counted = countBy(items, keyFn);
  return counted[0]?.name || '—';
}

function filterByDate<T extends { created_at: string }>(items: T[], from: string, to: string): T[] {
  return items.filter((item) => {
    const d = new Date(item.created_at);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to + 'T23:59:59')) return false;
    return true;
  });
}

function filterInteractions(data: InteractionAnalysis[], f: Filters): InteractionAnalysis[] {
  let result = filterByDate(data, f.dateFrom, f.dateTo);
  if (f.topic) result = result.filter((d) => d.main_topic === f.topic);
  if (f.barrier) result = result.filter((d) => d.barrier_type === f.barrier);
  if (f.emotion) result = result.filter((d) => d.emotion === f.emotion);
  if (f.urgency) result = result.filter((d) => d.urgency === f.urgency);
  if (f.needsReview === 'true') result = result.filter((d) => d.needs_review === true);
  if (f.needsReview === 'false') result = result.filter((d) => d.needs_review === false);
  return result;
}

function filterReports(data: InsightReport[], f: Filters): InsightReport[] {
  let result = filterByDate(data, f.dateFrom, f.dateTo);
  if (f.topic) result = result.filter((d) => d.top_topic === f.topic);
  if (f.barrier) result = result.filter((d) => d.top_barrier === f.barrier);
  if (f.emotion) result = result.filter((d) => d.dominant_emotion === f.emotion);
  return result;
}

export function useDashboardData() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const interactionsQuery = useQuery({
    queryKey: ['interaction-analysis'],
    queryFn: fetchInteractionAnalysis,
  });

  const reportsQuery = useQuery({
    queryKey: ['insight-reports'],
    queryFn: fetchInsightReports,
  });

  const allInteractions = interactionsQuery.data || [];
  const allReports = reportsQuery.data || [];

  // Extract unique filter options from raw data
  const filterOptions = useMemo(() => ({
    topics: [...new Set([
      ...allInteractions.map((d) => d.main_topic).filter(Boolean),
      ...allReports.map((d) => d.top_topic).filter(Boolean),
    ])] as string[],
    barriers: [...new Set([
      ...allInteractions.map((d) => d.barrier_type).filter(Boolean),
      ...allReports.map((d) => d.top_barrier).filter(Boolean),
    ])] as string[],
    emotions: [...new Set([
      ...allInteractions.map((d) => d.emotion).filter(Boolean),
      ...allReports.map((d) => d.dominant_emotion).filter(Boolean),
    ])] as string[],
    urgencies: [...new Set(allInteractions.map((d) => d.urgency).filter(Boolean))] as string[],
  }), [allInteractions, allReports]);

  const interactions = useMemo(() => filterInteractions(allInteractions, filters), [allInteractions, filters]);
  const reports = useMemo(() => filterReports(allReports, filters), [allReports, filters]);

  const isLoading = interactionsQuery.isLoading || reportsQuery.isLoading;
  const error = interactionsQuery.error || reportsQuery.error;

  return {
    interactions,
    reports,
    allInteractions,
    allReports,
    filters,
    setFilters,
    filterOptions,
    isLoading,
    error,
  };
}
