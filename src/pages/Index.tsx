import { useDashboardData, countBy, mostCommon } from '@/hooks/useDashboardData';
import { KPICard } from '@/components/dashboard/KPICard';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ReportsTable } from '@/components/dashboard/ReportsTable';
import { DiagnosticsTable } from '@/components/dashboard/DiagnosticsTable';
import { LineChartCard, BarChartCard, PieChartCard } from '@/components/dashboard/DashboardCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Clock3,
  FileText,
  MessageSquare,
  Radar,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import WebhookChat from '@/components/chat/WebhookChat';

function formatLabel(value?: string | null) {
  return value ? value.replace(/_/g, ' ') : 'n/a';
}

function aggregateByDay<T extends { created_at: string }>(items: T[], valueFn: (item: T) => number = () => 1) {
  const dailyTotals = new Map<string, { iso: string; label: string; cases: number }>();

  for (const item of items) {
    const date = new Date(item.created_at);
    const iso = format(date, 'yyyy-MM-dd');
    const existing = dailyTotals.get(iso);
    const nextValue = valueFn(item);

    if (existing) {
      existing.cases += nextValue;
      continue;
    }

    dailyTotals.set(iso, {
      iso,
      label: format(date, 'MMM dd'),
      cases: nextValue,
    });
  }

  return Array.from(dailyTotals.values())
    .sort((a, b) => a.iso.localeCompare(b.iso))
    .map(({ label, cases }) => ({ date: label, cases }));
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">{eyebrow}</p>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
      </div>
    </div>
  );
}

const Index = () => {
  const { interactions, reports, filters, setFilters, filterOptions, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load data. Please try again.
        </p>
      </div>
    );
  }

  const reportsCasesOverTime = aggregateByDay(reports, (report) => report.total_cases || 0);
  const reportsBarriers = countBy(reports, (report) => report.top_barrier);
  const reportsTopics = countBy(reports, (report) => report.top_topic);
  const reportsEmotions = countBy(reports, (report) => report.dominant_emotion);

  const interactionsCasesOverTime = aggregateByDay(interactions);
  const interactionBarriers = countBy(interactions, (item) => item.barrier_type);
  const interactionTopics = countBy(interactions, (item) => item.main_topic);
  const interactionEmotions = countBy(interactions, (item) => item.emotion);
  const interactionUrgency = countBy(interactions, (item) => item.urgency);
  const interactionNeedTypes = countBy(interactions, (item) => item.need_type);

  const latestTotalCases = reports.length > 0 ? reports[reports.length - 1].total_cases ?? '-' : '-';
  const totalReviews = interactions.filter((item) => item.needs_review).length;
  const highUrgencyCount = interactions.filter((item) => item.urgency === 'high' || item.urgency === 'critical').length;
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => (key === 'needsReview' ? value !== 'all' : Boolean(value))).length;
  const trackedProjects = new Set(reports.map((report) => report.project).filter(Boolean)).size;
  const reviewRate = interactions.length ? `${Math.round((totalReviews / interactions.length) * 100)}%` : '0%';
  const latestReportDate = reports.length ? format(new Date(reports[reports.length - 1].created_at), 'MMM dd, yyyy') : 'No report yet';
  const topTopic = formatLabel(mostCommon(interactions, (item) => item.main_topic));
  const topBarrier = formatLabel(mostCommon(interactions, (item) => item.barrier_type));
  const topEmotion = formatLabel(mostCommon(interactions, (item) => item.emotion));

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_32%),linear-gradient(180deg,rgba(8,15,31,0.36),transparent_90%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[24rem] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
        <header className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Civic Intelligence
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-cyan-200" />
                Latest report: {latestReportDate}
              </span>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
              <div className="space-y-5">
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                    Community Access <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">Insight Dashboard</span>
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                    A sharper view into public-service access barriers, real-time signals, and intervention priorities across the incoming case flow.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top topic</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{topTopic}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top barrier</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{topBarrier}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Top emotion</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{topEmotion}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/18 via-cyan-400/6 to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-cyan-100">Live interactions</span>
                    <Activity className="h-4 w-4 text-cyan-200" />
                  </div>
                  <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{interactions.length}</p>
                  <p className="mt-2 text-sm text-cyan-100/75">Review rate: {reviewRate}</p>
                </div>

                <div className="rounded-[28px] border border-indigo-300/15 bg-gradient-to-br from-indigo-400/20 via-indigo-400/8 to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-100">Monitoring scope</span>
                    <Radar className="h-4 w-4 text-indigo-200" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-indigo-100/80">
                    <div className="flex items-center justify-between">
                      <span>Tracked projects</span>
                      <span className="font-semibold text-foreground">{trackedProjects || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>High urgency cases</span>
                      <span className="font-semibold text-foreground">{highUrgencyCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active filters</span>
                      <span className="font-semibold text-foreground">{activeFilterCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ExecutiveSummary interactions={interactions} reports={reports} />
            </div>
          </div>

          <WebhookChat />
        </header>

        <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />

        <Tabs defaultValue="weekly" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <SectionHeading
              eyebrow="Dashboard modes"
              title="Switch between trend intelligence, live diagnostics, and system signals"
              description="The visual system is tuned to help you spot where volume, urgency, and support needs cluster first."
            />

            <TabsList className="h-auto rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
              <TabsTrigger
                value="weekly"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:bg-cyan-400/15 data-[state=active]:text-cyan-100 data-[state=active]:shadow-none"
              >
                Weekly pulse
              </TabsTrigger>
              <TabsTrigger
                value="diagnostics"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:bg-indigo-400/15 data-[state=active]:text-indigo-100 data-[state=active]:shadow-none"
              >
                Diagnostics
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground data-[state=active]:bg-amber-400/15 data-[state=active]:text-amber-100 data-[state=active]:shadow-none"
              >
                Signals
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <KPICard title="Insight Reports" value={reports.length} icon={FileText} subtitle="Analyst summaries available" tone="indigo" />
                  <KPICard title="Latest Total Cases" value={latestTotalCases} icon={Activity} subtitle="Most recent reporting snapshot" tone="cyan" accent />
                  <KPICard title="Top Barrier" value={formatLabel(mostCommon(reports, (report) => report.top_barrier))} icon={Shield} subtitle="Most repeated access obstacle" tone="amber" />
                  <KPICard title="Top Topic" value={formatLabel(mostCommon(reports, (report) => report.top_topic))} icon={TrendingUp} subtitle="Most discussed service area" tone="violet" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <LineChartCard
                    title="Cases Over Time"
                    description="Reported demand trend across the reporting window."
                    data={reportsCasesOverTime}
                    tone="cyan"
                  />
                  <PieChartCard
                    title="Emotion Distribution"
                    description="Dominant emotional mix detected in the reports."
                    data={reportsEmotions}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <BarChartCard
                    title="Top Barriers"
                    description="Barrier categories driving the highest case volume."
                    data={reportsBarriers}
                    color="hsl(184 83% 55%)"
                    layout="horizontal"
                  />
                  <BarChartCard
                    title="Top Topics"
                    description="Topic clusters surfacing most often in the reporting layer."
                    data={reportsTopics}
                    color="hsl(263 89% 70%)"
                    layout="horizontal"
                  />
                </div>

                <ReportsTable reports={reports} />
              </div>

              <AlertsPanel interactions={interactions} />
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              <KPICard title="Total Interactions" value={interactions.length} icon={MessageSquare} subtitle="Messages processed in this view" tone="cyan" accent />
              <KPICard title="Needs Review" value={totalReviews} icon={AlertTriangle} subtitle="Flagged for human support" tone="rose" />
              <KPICard title="Top Barrier" value={formatLabel(mostCommon(interactions, (item) => item.barrier_type))} icon={Shield} subtitle="Most frequent real-time barrier" tone="amber" />
              <KPICard title="Top Topic" value={formatLabel(mostCommon(interactions, (item) => item.main_topic))} icon={BarChart3} subtitle="Highest-volume active topic" tone="violet" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
              <LineChartCard
                title="Interaction Volume"
                description="Daily interaction intake across the filtered activity stream."
                data={interactionsCasesOverTime}
                tone="indigo"
              />
              <PieChartCard
                title="Emotion Analysis"
                description="Live emotional profile inferred from the interaction stream."
                data={interactionEmotions}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <BarChartCard
                title="Barrier Types"
                description="Most common blockers by category."
                data={interactionBarriers}
                color="hsl(184 83% 55%)"
                layout="horizontal"
              />
              <BarChartCard
                title="Main Topics"
                description="Primary themes surfacing in recent interactions."
                data={interactionTopics}
                color="hsl(222 89% 63%)"
                layout="horizontal"
              />
              <BarChartCard
                title="Urgency Levels"
                description="High-priority case mix inside the current filter scope."
                data={interactionUrgency}
                color="hsl(344 88% 63%)"
                layout="horizontal"
              />
            </div>

            <BarChartCard
              title="Need Types"
              description="Support categories most often requested in conversations."
              data={interactionNeedTypes}
              color="hsl(38 92% 58%)"
              layout="horizontal"
            />

            <DiagnosticsTable interactions={interactions} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <AlertsPanel interactions={interactions} />
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <KPICard title="Cases Requiring Review" value={totalReviews} icon={AlertTriangle} subtitle="Manual intervention candidates" tone="rose" />
                  <KPICard title="High Urgency" value={highUrgencyCount} icon={Radar} subtitle="Critical and high-priority interactions" tone="amber" />
                  <KPICard title="Emotion In Focus" value={topEmotion} icon={Brain} subtitle="Most frequent emotional signal" tone="indigo" />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <LineChartCard
                    title="Signal Momentum"
                    description="Interaction volume trend supporting alert monitoring."
                    data={interactionsCasesOverTime}
                    tone="cyan"
                  />
                  <PieChartCard
                    title="Escalation Mix"
                    description="Urgency distribution for the currently filtered interactions."
                    data={interactionUrgency}
                  />
                </div>

                <DiagnosticsTable interactions={interactions.filter((item) => item.needs_review || item.urgency === 'high' || item.urgency === 'critical')} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
