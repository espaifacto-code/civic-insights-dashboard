import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { type InsightReport } from '@/lib/supabaseApi';
import { format } from 'date-fns';

interface Props {
  reports: InsightReport[];
}

export function ReportsTable({ reports }: Props) {
  if (!reports.length) {
    return (
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">Insight Reports</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No data available</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Insight Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Report Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <Collapsible key={r.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell><ChevronDown className="h-4 w-4 text-muted-foreground" /></TableCell>
                        <TableCell className="text-xs font-mono">{format(new Date(r.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-xs">{r.project || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[300px] truncate">{r.report?.slice(0, 100) || '—'}</TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/30 p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{r.report || 'No report content.'}</p>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
