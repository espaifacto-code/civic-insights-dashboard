import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type InteractionAnalysis } from '@/lib/supabaseApi';
import { format } from 'date-fns';

interface Props {
  interactions: InteractionAnalysis[];
}

export function DiagnosticsTable({ interactions }: Props) {
  if (!interactions.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">Interaction Diagnostics</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No data available</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Interaction Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Barrier</TableHead>
                <TableHead>Emotion</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Need Type</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((row) => (
                <TableRow key={row.id} className={row.needs_review ? 'bg-[hsl(var(--warning))]/8' : ''}>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{format(new Date(row.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="text-xs">{row.main_topic?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-xs">{row.barrier_type?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-xs">{row.emotion || '—'}</TableCell>
                  <TableCell className="text-xs">
                    {row.urgency ? (
                      <Badge variant={row.urgency === 'high' || row.urgency === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                        {row.urgency}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-xs">{row.need_type?.replace(/_/g, ' ') || '—'}</TableCell>
                  <TableCell className="text-xs">
                    {row.needs_review ? (
                      <Badge variant="destructive" className="text-xs">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{row.short_summary || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
