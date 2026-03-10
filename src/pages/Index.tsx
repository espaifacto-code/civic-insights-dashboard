import { useDashboardData, countBy } from '@/hooks/useDashboardData';
import { KPICard } from '@/components/dashboard/KPICard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ReportsTable } from '@/components/dashboard/ReportsTable';
import { DiagnosticsTable } from '@/components/dashboard/DiagnosticsTable';
import { LineChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity, AlertTriangle, Brain, TrendingUp, FileText,
  Shield, MessageSquare, BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { mostCommon } from '@/hooks/useDashboardData';

const Index = () => {
  const { interactions, reports, filters, setFilters, filterOptions, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive text-sm">Failed to load data. Please try again.</p>
      </div>
    );
  }

  // Compute chart data for insight_reports
  const reportsCasesOverTime = reports.map((r) => ({
    date: format(new Date(r.created_at), 'MMM dd'),
    cases: r.total_cases || 0,
  }));
  const reportsBarriers = countBy(reports, (r) => r.top_barrier);
  const reportsTopics = countBy(reports, (r) => r.top_topic);
  const reportsEmotions = countBy(reports, (r) => r.dominant_emotion);

  // Compute chart data for interaction_analysis
  const dateMap: Record<string, number> = {};
  for (const row of interactions) {
    const day = format(new Date(row.created_at), 'MMM dd');
    dateMap[day] = (dateMap[day] || 0) + 1;
  }
  const interactionsCasesOverTime = Object.entries(dateMap).map(([date, cases]) => ({ date, cases }));

  const iaBarriers = countBy(interactions, (d) => d.barrier_type);
  const iaTopics = countBy(interactions, (d) => d.main_topic);
  const iaEmotions = countBy(interactions, (d) => d.emotion);
  const iaUrgency = countBy(interactions, (d) => d.urgency);
  const iaNeedType = countBy(interactions, (d) => d.need_type);

  const latestTotalCases = reports.length > 0 ? (reports[reports.length - 1].total_cases ?? '—') : '—';

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Community Access Insight Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">AI-assisted monitoring of barriers to public services</p>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary interactions={interactions} reports={reports} />

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />

      {/* Tabs */}
      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="weekly" className="text-xs">Weekly Insights</TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs">Diagnostics</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
        </TabsList>

        {/* Section 1: Weekly Insight Overview */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard title="Insight Reports" value={reports.length} icon={FileText} />
            <KPICard title="Latest Total Cases" value={latestTotalCases} icon={Activity} accent />
            <KPICard title="Top Barrier" value={mostCommon(reports, (r) => r.top_barrier).replace(/_/g, ' ')} icon={Shield} />
            <KPICard title="Top Topic" value={mostCommon(reports, (r) => r.top_topic).replace(/_/g, ' ')} icon={TrendingUp} />
            <KPICard title="Top Emotion" value={mostCommon(reports, (r) => r.dominant_emotion)} icon={Brain} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LineChartCard title="Total Cases Over Time" data={reportsCasesOverTime} />
            <PieChartCard title="Emotion Distribution" data={reportsEmotions} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarChartCard title="Top Barriers" data={reportsBarriers} color="hsl(174, 55%, 42%)" />
            <BarChartCard title="Top Topics" data={reportsTopics} color="hsl(262, 48%, 52%)" />
          </div>

          <ReportsTable reports={reports} />
        </TabsContent>

        {/* Section 2: Real-time Interaction Diagnostics */}
        <TabsContent value="diagnostics" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Interactions" value={interactions.length} icon={MessageSquare} accent />
            <KPICard title="Needs Review" value={interactions.filter((d) => d.needs_review).length} icon={AlertTriangle} subtitle="Flagged for human support" />
            <KPICard title="Top Barrier" value={mostCommon(interactions, (d) => d.barrier_type).replace(/_/g, ' ')} icon={Shield} />
            <KPICard title="Top Topic" value={mostCommon(interactions, (d) => d.main_topic).replace(/_/g, ' ')} icon={BarChart3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BarChartCard title="Barrier Types" data={iaBarriers} color="hsl(215, 72%, 45%)" />
            <BarChartCard title="Main Topics" data={iaTopics} color="hsl(174, 55%, 42%)" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PieChartCard title="Emotion Distribution" data={iaEmotions} />
            <BarChartCard title="Urgency Levels" data={iaUrgency} color="hsl(340, 68%, 50%)" />
            <BarChartCard title="Need Types" data={iaNeedType} color="hsl(34, 92%, 50%)" />
          </div>

          <DiagnosticsTable interactions={interactions} />
        </TabsContent>

        {/* Section 3: Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel interactions={interactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
