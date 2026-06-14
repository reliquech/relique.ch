import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ResultTableRow {
  label: string;
  value: string | React.ReactNode;
}

interface ResultTableProps {
  rows: ResultTableRow[];
  className?: string;
}

export function ResultTable({ rows, className }: ResultTableProps) {
  return (
    <div className={cn("overflow-hidden border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Field</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-muted-foreground">
                {row.label}
              </TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

