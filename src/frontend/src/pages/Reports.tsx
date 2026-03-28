import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Category } from "../backend.d";
import {
  useAllInventoryItems,
  useAllIssueRecords,
  useCategorySummary,
} from "../hooks/useQueries";
import { CATEGORY_CONFIG, formatDate } from "../lib/categoryUtils";

const CATEGORY_ORDER = [
  Category.electrical,
  Category.plumbing,
  Category.carpentry,
  Category.housekeeping,
];

const SKEL4 = ["a", "b", "c", "d"];

export default function Reports() {
  const { data: summary = [], isLoading: loadSummary } = useCategorySummary();
  const { data: issueRecords = [], isLoading: loadIssues } =
    useAllIssueRecords();
  const { data: items = [] } = useAllInventoryItems();

  const itemMap = Object.fromEntries(items.map((i) => [String(i.id), i]));
  const totalItems = summary.reduce((acc, s) => acc + Number(s.itemCount), 0);
  const totalQty = summary.reduce((acc, s) => acc + Number(s.totalQuantity), 0);

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {loadSummary ? (
            <div
              data-ocid="reports.summary.loading_state"
              className="space-y-2"
            >
              {SKEL4.map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {CATEGORY_ORDER.map((cat) => {
                  const s = summary.find((x) => x.category === cat);
                  const cfg = CATEGORY_CONFIG[cat];
                  const count = s ? Number(s.itemCount) : 0;
                  const qty = s ? Number(s.totalQuantity) : 0;
                  const pct = totalItems > 0 ? (count / totalItems) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={cn("font-medium", cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="text-muted-foreground">
                          {count} items · {qty} units
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            cfg.dot,
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Item Types</TableHead>
                    <TableHead className="text-right">Total Units</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CATEGORY_ORDER.map((cat, i) => {
                    const s = summary.find((x) => x.category === cat);
                    const cfg = CATEGORY_CONFIG[cat];
                    const count = s ? Number(s.itemCount) : 0;
                    const qty = s ? Number(s.totalQuantity) : 0;
                    const pct =
                      totalItems > 0
                        ? ((count / totalItems) * 100).toFixed(1)
                        : "0";
                    return (
                      <TableRow
                        key={cat}
                        data-ocid={`reports.category.item.${i + 1}`}
                      >
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              cfg.badge,
                            )}
                          >
                            {cfg.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {count}
                        </TableCell>
                        <TableCell className="text-right">{qty}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {pct}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{totalItems}</TableCell>
                    <TableCell className="text-right">{totalQty}</TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Issuance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadIssues ? (
            <div
              data-ocid="reports.issues.loading_state"
              className="p-6 space-y-2"
            >
              {SKEL4.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : issueRecords.length === 0 ? (
            <div
              data-ocid="reports.issues.empty_state"
              className="py-12 text-center text-muted-foreground text-sm"
            >
              No issuance records yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issueRecords.map((record, i) => {
                  const item = itemMap[String(record.itemId)];
                  return (
                    <TableRow
                      key={String(record.id)}
                      data-ocid={`reports.issue.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {item?.name ?? `#${String(record.itemId)}`}
                      </TableCell>
                      <TableCell>{record.issuedTo}</TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell>{String(record.quantity)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(record.issuedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[160px] truncate">
                        {record.notes || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
