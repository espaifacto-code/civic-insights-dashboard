import { useInsightsData } from '@/hooks/useInsightsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { Activity, AlertTriangle, Brain, TrendingUp } from 'lucide-react';

const COLORS = [
  'hsl(174, 62%, 47%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 52%, 56%)',
  'hsl(34, 100%, 50%)',
  'hsl(340, 75%, 55%)',
  'hsl(150, 60%, 45%)',
];

function StatCard({ title, value, icon: Icon, subtitle }: { title: string; value: string | number; icon: React.ElementType; subtitle?: string }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight font-mono text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Index = () => {
  const { data, isLoading, error } = useInsightsData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-mono">Loading insights…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Failed to load data.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Civic AI <span className="text-primary">Insights</span>
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">Real-time interaction analysis dashboard</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cases" value={data.totalCases} icon={Activity} />
        <StatCard title="Needs Review" value={data.needsReview} icon={AlertTriangle} subtitle="Flagged for human support" />
        <StatCard title="Top Emotion" value={data.emotions[0]?.name || '—'} icon={Brain} />
        <StatCard title="Top Topic" value={data.topTopics[0]?.name?.replace(/_/g, ' ') || '—'} icon={TrendingUp} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Over Time */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Cases Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.casesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 22%)" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 18%, 22%)', borderRadius: 8, color: 'hsl(210, 20%, 92%)' }} />
                  <Line type="monotone" dataKey="cases" stroke="hsl(174, 62%, 47%)" strokeWidth={2.5} dot={{ fill: 'hsl(174, 62%, 47%)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dominant Emotions */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Dominant Emotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.emotions}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.emotions.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 18%, 22%)', borderRadius: 8, color: 'hsl(210, 20%, 92%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Barriers */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Barriers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topBarriers.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 22%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 18%, 22%)', borderRadius: 8, color: 'hsl(210, 20%, 92%)' }} />
                  <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTopics.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 22%)" />
                  <XAxis type="number" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 12 }} width={140} />
                  <Tooltip contentStyle={{ background: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 18%, 22%)', borderRadius: 8, color: 'hsl(210, 20%, 92%)' }} />
                  <Bar dataKey="count" fill="hsl(262, 52%, 56%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
