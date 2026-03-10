import { type Filters } from '@/hooks/useDashboardData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { type ReactNode } from 'react';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  options: {
    topics: string[];
    barriers: string[];
    emotions: string[];
    urgencies: string[];
  };
}

export function FilterBar({ filters, onChange, options }: FilterBarProps) {
  const update = (key: keyof Filters, value: string) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ dateFrom: '', dateTo: '', topic: '', barrier: '', emotion: '', urgency: '', needsReview: 'all' });
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => (key === 'needsReview' ? value !== 'all' : Boolean(value))).length;

  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>
        <p className="text-sm text-muted-foreground">
          Tune the dashboard scope by time, topic, barrier, emotion, urgency, and review state.
        </p>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="ml-auto rounded-full border border-white/10 bg-white/5 px-4 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear {activeFilterCount}
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
        <FilterInput
          label="From"
          input={
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => update('dateFrom', event.target.value)}
              className="h-11 rounded-2xl border-white/10 bg-slate-950/35 text-sm text-foreground"
            />
          }
        />

        <FilterInput
          label="To"
          input={
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(event) => update('dateTo', event.target.value)}
              className="h-11 rounded-2xl border-white/10 bg-slate-950/35 text-sm text-foreground"
            />
          }
        />

        <FilterSelect label="Topic" value={filters.topic} options={options.topics} onChange={(value) => update('topic', value)} />
        <FilterSelect label="Barrier" value={filters.barrier} options={options.barriers} onChange={(value) => update('barrier', value)} />
        <FilterSelect label="Emotion" value={filters.emotion} options={options.emotions} onChange={(value) => update('emotion', value)} />
        <FilterSelect label="Urgency" value={filters.urgency} options={options.urgencies} onChange={(value) => update('urgency', value)} />
        <FilterSelect label="Needs Review" value={filters.needsReview} options={['all', 'true', 'false']} onChange={(value) => update('needsReview', value)} />
      </div>
    </div>
  );
}

function FilterInput({ label, input }: { label: string; input: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">{label}</label>
      {input}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">{label}</label>
      <Select value={value || 'all'} onValueChange={(nextValue) => onChange(nextValue === 'all' ? '' : nextValue)}>
        <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-slate-950/35 text-sm text-foreground">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-slate-950/95 text-foreground backdrop-blur-xl">
          <SelectItem value="all">All</SelectItem>
          {options
            .filter((option) => option !== 'all')
            .map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
