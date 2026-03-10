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
  needsReview: string;
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
    const value = keyFn(item);
    if (value && value.trim() !== '') {
      counts[value] = (counts[value] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
}

export function mostCommon<T>(items: T[], keyFn: (item: T) => string | null | undefined): string {
  const counted = countBy(items, keyFn);
  return counted[0]?.name || '-';
}

function filterByDate<T extends { created_at: string }>(items: T[], from: string, to: string): T[] {
  return items.filter((item) => {
    const date = new Date(item.created_at);
    if (from && date < new Date(from)) return false;
    if (to && date > new Date(`${to}T23:59:59`)) return false;
    return true;
  });
}

function filterInteractions(data: InteractionAnalysis[], filters: Filters): InteractionAnalysis[] {
  let result = filterByDate(data, filters.dateFrom, filters.dateTo);
  if (filters.topic) result = result.filter((item) => item.main_topic === filters.topic);
  if (filters.barrier) result = result.filter((item) => item.barrier_type === filters.barrier);
  if (filters.emotion) result = result.filter((item) => item.emotion === filters.emotion);
  if (filters.urgency) result = result.filter((item) => item.urgency === filters.urgency);
  if (filters.needsReview === 'true') result = result.filter((item) => item.needs_review === true);
  if (filters.needsReview === 'false') result = result.filter((item) => item.needs_review === false);
  return result;
}

function filterReports(data: InsightReport[], filters: Filters): InsightReport[] {
  let result = filterByDate(data, filters.dateFrom, filters.dateTo);
  if (filters.topic) result = result.filter((item) => item.top_topic === filters.topic);
  if (filters.barrier) result = result.filter((item) => item.top_barrier === filters.barrier);
  if (filters.emotion) result = result.filter((item) => item.dominant_emotion === filters.emotion);
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

  const filterOptions = useMemo(
    () => ({
      topics: [
        ...new Set([
          ...allInteractions.map((item) => item.main_topic).filter(Boolean),
          ...allReports.map((item) => item.top_topic).filter(Boolean),
        ]),
      ] as string[],
      barriers: [
        ...new Set([
          ...allInteractions.map((item) => item.barrier_type).filter(Boolean),
          ...allReports.map((item) => item.top_barrier).filter(Boolean),
        ]),
      ] as string[],
      emotions: [
        ...new Set([
          ...allInteractions.map((item) => item.emotion).filter(Boolean),
          ...allReports.map((item) => item.dominant_emotion).filter(Boolean),
        ]),
      ] as string[],
      urgencies: [...new Set(allInteractions.map((item) => item.urgency).filter(Boolean))] as string[],
    }),
    [allInteractions, allReports],
  );

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
