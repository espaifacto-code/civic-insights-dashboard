import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileText } from 'lucide-react';
import { type InsightReport } from '@/lib/supabaseApi';
import { format } from 'date-fns';

interface Props {
  reports: InsightReport[];
}

export function ReportsTable({ reports }: Props) {
  if (!reports.length) {
    return (
      <Card className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_-48px_rgba(4,12,24,0.9)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Insight Reports</CardTitle>
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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100">
            <FileText className="h-3.5 w-3.5" />
            Narrative Reports
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">Insight Reports</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">Expand any row to inspect the full written report generated for that period.</p>
        </div>
        <p className="text-sm text-muted-foreground">{reports.length} reports in view</p>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-slate-950/30">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-12 text-xs uppercase tracking-[0.22em] text-muted-foreground"></TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Project</TableHead>
                <TableHead className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <Collapsible key={report.id} asChild>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer border-white/5 transition-colors hover:bg-white/5">
                        <TableCell>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs font-mono text-slate-200">
                          {format(new Date(report.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{report.project || '-'}</TableCell>
                        <TableCell className="max-w-[28rem] truncate text-sm text-muted-foreground">{report.report?.slice(0, 120) || '-'}</TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="border-white/5">
                        <TableCell colSpan={4} className="bg-white/[0.03] p-0">
                          <div className="border-t border-white/5 p-5">
                            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">{report.report || 'No report content.'}</p>
                          </div>
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
