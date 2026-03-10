import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = [
  'hsl(176 54% 48%)',
  'hsl(199 88% 54%)',
  'hsl(263 59% 59%)',
  'hsl(281 56% 61%)',
  'hsl(329 85% 62%)',
  'hsl(38 92% 58%)',
];

const gridColor = 'hsla(223, 26%, 68%, 0.12)';
const tickStyle = { fill: 'hsla(220, 23%, 72%, 0.82)', fontSize: 12 };

interface ChartData {
  name: string;
  count: number;
}

interface TimeData {
  date: string;
  cases: number;
}

function formatLabel(value: string | number) {
  return String(value).replace(/_/g, ' ');
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,29,48,0.96),rgba(17,24,39,0.92))] shadow-[0_30px_80px_-48px_rgba(0,0,0,0.95)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-slate-100">{title}</CardTitle>
        {description && <p className="text-sm leading-6 text-slate-400">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; payload?: { name?: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0];
  const name = datum.payload?.name || datum.name || label || 'Value';

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1324] px-4 py-3 text-sm text-slate-100 shadow-2xl">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{formatLabel(name)}</p>
      <p className="mt-1 text-base font-semibold text-white">{datum.value}</p>
    </div>
  );
}

export function LineChartCard({
  title,
  description,
  data,
  tone = 'hsl(184 83% 55%)',
}: {
  title: string;
  description?: string;
  data: TimeData[];
  tone?: string;
}) {
  if (!data.length) return <EmptyChart title={title} description={description} />;

  const gradientId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-gradient`;

  return (
    <ChartCard title={title} description={description}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={tone} stopOpacity={0.4} />
                <stop offset="100%" stopColor={tone} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 5" vertical={false} />
            <XAxis dataKey="date" tick={tickStyle} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cases"
              stroke={tone}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={{ r: 0 }}
              activeDot={{ r: 4, fill: tone, stroke: '#0b1324', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function BarChartCard({
  title,
  description,
  data,
  color = COLORS[0],
  layout = 'vertical',
}: {
  title: string;
  description?: string;
  data: ChartData[];
  color?: string;
  layout?: 'horizontal' | 'vertical';
}) {
  if (!data.length) return <EmptyChart title={title} description={description} />;

  const chartData = data.slice(0, 6);
  const isHorizontal = layout === 'horizontal';

  return (
    <ChartCard title={title} description={description}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={isHorizontal ? { top: 8, right: 16, left: 16, bottom: 8 } : { top: 8, right: 8, left: -18, bottom: 8 }}
            barCategoryGap={14}
          >
            <CartesianGrid stroke={gridColor} strokeDasharray="3 5" horizontal={isHorizontal} vertical={!isHorizontal} />
            {isHorizontal ? (
              <>
                <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                  width={120}
                  tickFormatter={formatLabel}
                />
              </>
            ) : (
              <>
                <XAxis type="category" dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} tickFormatter={formatLabel} />
                <YAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              </>
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" fill={color} radius={isHorizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={28}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function renderPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
  fill,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
  fill?: string;
}) {
  if (!cx || !cy || !outerRadius || !percent || percent < 0.05) {
    return null;
  }

  const angle = ((midAngle || 0) * Math.PI) / 180;
  const sx = cx + Math.cos(-angle) * (outerRadius + 2);
  const sy = cy + Math.sin(-angle) * (outerRadius + 2);
  const mx = cx + Math.cos(-angle) * (outerRadius + 18);
  const my = cy + Math.sin(-angle) * (outerRadius + 18);
  const ex = mx + (Math.cos(-angle) >= 0 ? 20 : -20);
  const ey = my;
  const textAnchor = ex > cx ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.4} />
      <circle cx={sx} cy={sy} r={2} fill={fill} />
      <text x={ex + (textAnchor === 'start' ? 4 : -4)} y={ey - 2} textAnchor={textAnchor} fill={fill} fontSize={11}>
        {`${formatLabel(name || '')} ${Math.round(percent * 100)}%`}
      </text>
    </g>
  );
}

export function PieChartCard({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: ChartData[];
}) {
  if (!data.length) return <EmptyChart title={title} description={description} />;

  const chartData = data.slice(0, 4);

  return (
    <ChartCard title={title} description={description}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={102}
              paddingAngle={2}
              stroke="#d9eef0"
              strokeWidth={1.6}
              labelLine={false}
              label={renderPieLabel}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

function EmptyChart({ title, description }: { title: string; description?: string }) {
  return (
    <ChartCard title={title} description={description}>
      <div className="flex h-[300px] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-[#111827]">
        <p className="text-sm text-slate-400">No data available.</p>
      </div>
    </ChartCard>
  );
}
