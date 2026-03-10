import { type Filters } from '@/hooks/useDashboardData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
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
  const hasFilters = filters.dateFrom || filters.dateTo || filters.topic || filters.barrier || filters.emotion || filters.urgency || filters.needsReview !== 'all';

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="ml-auto h-7 text-xs">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">From</label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => update('dateFrom', e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">To</label>
          <Input type="date" value={filters.dateTo} onChange={(e) => update('dateTo', e.target.value)} className="h-8 text-xs" />
        </div>
        <FilterSelect label="Topic" value={filters.topic} options={options.topics} onChange={(v) => update('topic', v)} />
        <FilterSelect label="Barrier" value={filters.barrier} options={options.barriers} onChange={(v) => update('barrier', v)} />
        <FilterSelect label="Emotion" value={filters.emotion} options={options.emotions} onChange={(v) => update('emotion', v)} />
        <FilterSelect label="Urgency" value={filters.urgency} options={options.urgencies} onChange={(v) => update('urgency', v)} />
        <FilterSelect label="Needs Review" value={filters.needsReview} options={['all', 'true', 'false']} onChange={(v) => update('needsReview', v)} />
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <Select value={value || 'all'} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.filter(o => o !== 'all').map((opt) => (
            <SelectItem key={opt} value={opt}>{opt.replace(/_/g, ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
