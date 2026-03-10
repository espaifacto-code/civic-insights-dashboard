import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = [
  'hsl(215, 72%, 45%)',
  'hsl(174, 55%, 42%)',
  'hsl(262, 48%, 52%)',
  'hsl(34, 92%, 50%)',
  'hsl(340, 68%, 50%)',
  'hsl(150, 50%, 40%)',
  'hsl(200, 60%, 55%)',
  'hsl(280, 45%, 60%)',
];

const tooltipStyle = {
  background: '#fff',
  border: '1px solid hsl(220, 13%, 88%)',
  borderRadius: 8,
  color: 'hsl(222, 47%, 11%)',
  fontSize: 12,
};

interface ChartData {
  name: string;
  count: number;
}

interface TimeData {
  date: string;
  cases: number;
}

export function LineChartCard({ title, data }: { title: string; data: TimeData[] }) {
  if (!data.length) return <EmptyChart title={title} />;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cases" stroke="hsl(215, 72%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(215, 72%, 45%)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BarChartCard({ title, data, color }: { title: string; data: ChartData[]; color?: string }) {
  if (!data.length) return <EmptyChart title={title} />;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={color || COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PieChartCard({ title, data }: { title: string; data: ChartData[] }) {
  if (!data.length) return <EmptyChart title={title} />;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.slice(0, 6)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ title }: { title: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[240px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      </CardContent>
    </Card>
  );
}
