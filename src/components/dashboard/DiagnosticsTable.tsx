import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type InteractionAnalysis } from '@/lib/supabaseApi';
import { format } from 'date-fns';

interface Props {
  interactions: InteractionAnalysis[];
}

function formatLabel(value?: string | null) {
  return value ? value.replace(/_/g, ' ') : '-';
}

function urgencyBadgeClasses(urgency?: string | null) {
  switch (urgency) {
    case 'critical':
      return 'border-rose-300/20 bg-rose-400/15 text-rose-100';
    case 'high':
      return 'border-amber-300/20 bg-amber-400/15 text-amber-100';
    case 'medium':
      return 'border-indigo-300/20 bg-indigo-400/15 text-indigo-100';
    case 'low':
      return 'border-cyan-300/20 bg-cyan-400/15 text-cyan-100';
    default:
      return 'border-white/10 bg-white/5 text-muted-foreground';
  }
}

export function DiagnosticsTable({ interactions }: Props) {
  if (!interactions.length) {
    return (
      <Card className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Interaction Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Interaction Diagnostics</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Row-level evidence for review status, urgency, topic, barrier, and case summary.</p>
        </div>
        <p className="text-sm text-muted-foreground">{interactions.length} interactions in view</p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-slate-950/30">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Topic</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Barrier</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Emotion</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Urgency</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Need Type</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Review</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => (
                <TableRow
                  key={interaction.id}
                  className={`border-white/5 transition-colors hover:bg-white/5 ${interaction.needs_review ? 'bg-amber-300/[0.06]' : ''}`}
                >
                  <TableCell className="whitespace-nowrap text-xs font-mono text-slate-200">
                    {format(new Date(interaction.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{formatLabel(interaction.main_topic)}</TableCell>
                  <TableCell className="text-sm text-foreground">{formatLabel(interaction.barrier_type)}</TableCell>
                  <TableCell className="text-sm text-foreground">{formatLabel(interaction.emotion)}</TableCell>
                  <TableCell className="text-sm">
                    {interaction.urgency ? (
                      <Badge variant="outline" className={`rounded-full border px-2.5 py-1 text-xs ${urgencyBadgeClasses(interaction.urgency)}`}>
                        {interaction.urgency}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{formatLabel(interaction.need_type)}</TableCell>
                  <TableCell className="text-sm">
                    {interaction.needs_review ? (
                      <Badge variant="outline" className="rounded-full border border-rose-300/20 bg-rose-400/15 px-2.5 py-1 text-xs text-rose-100">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[22rem] truncate text-sm text-muted-foreground">{interaction.short_summary || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
