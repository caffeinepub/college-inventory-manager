import { Badge } from "@/components/ui/badge";
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
import { AlertTriangle, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { Category } from "../backend.d";
import {
  useAllInventoryItems,
  useCategorySummary,
  useLowStockItems,
} from "../hooks/useQueries";
import { CATEGORY_CONFIG, getStockStatus } from "../lib/categoryUtils";

const CATEGORY_ORDER = [
  Category.electrical,
  Category.plumbing,
  Category.carpentry,
  Category.housekeeping,
];

const CATEGORY_IMAGES: Record<string, string> = {
  [Category.electrical]:
    "/assets/generated/electrical-category.dim_400x300.png",
  [Category.plumbing]: "/assets/generated/plumbing-category.dim_400x300.png",
  [Category.carpentry]: "/assets/generated/carpentry-category.dim_400x300.png",
  [Category.housekeeping]:
    "/assets/generated/housekeeping-category.dim_400x300.png",
};

const SKEL_ITEMS = ["a", "b", "c", "d", "e"];

export default function Dashboard() {
  const { data: items = [], isLoading: loadingItems } = useAllInventoryItems();
  const { data: summary = [], isLoading: loadingSummary } =
    useCategorySummary();
  const { data: lowStock = [] } = useLowStockItems();

  const summaryMap = Object.fromEntries(summary.map((s) => [s.category, s]));

  const StatusBadge = ({
    qty,
    threshold,
  }: { qty: bigint; threshold: bigint }) => {
    const status = getStockStatus(qty, threshold);
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
          status === "low" && "bg-red-100 text-red-700",
          status === "medium" && "bg-amber-100 text-amber-700",
          status === "in-stock" && "bg-green-100 text-green-700",
        )}
      >
        {status === "low"
          ? "Low Stock"
          : status === "medium"
            ? "Medium"
            : "In Stock"}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="dashboard.low_stock.panel"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">
              {lowStock.length} item{lowStock.length > 1 ? "s" : ""}
            </span>{" "}
            are running low on stock:{" "}
            {lowStock
              .slice(0, 3)
              .map((i) => i.name)
              .join(", ")}
            {lowStock.length > 3 ? ` and ${lowStock.length - 3} more` : ""}.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {CATEGORY_ORDER.map((cat, idx) => {
          const cfg = CATEGORY_CONFIG[cat];
          const s = summaryMap[cat];
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Card
                data-ocid={`dashboard.${cat}.card`}
                className="shadow-card overflow-hidden"
              >
                <img
                  src={CATEGORY_IMAGES[cat]}
                  alt={cfg.label}
                  className="w-full h-28 object-cover rounded-t-xl"
                />
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {cfg.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSummary ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">
                        {s ? String(s.itemCount) : "0"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s ? String(s.totalQuantity) : "0"} total units
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="shadow-card" data-ocid="dashboard.inventory.panel">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Current Inventory Status</CardTitle>
          {lowStock.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <TrendingDown className="w-3 h-3" />
              {lowStock.length} Low Stock
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loadingItems ? (
            <div
              data-ocid="dashboard.inventory.loading_state"
              className="p-6 space-y-2"
            >
              {SKEL_ITEMS.map((k) => (
                <Skeleton key={k} className="h-9 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="dashboard.inventory.empty_state"
              className="py-12 text-center text-muted-foreground text-sm"
            >
              No inventory items yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 10).map((item, i) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  return (
                    <TableRow
                      key={String(item.id)}
                      data-ocid={`dashboard.inventory.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{item.name}</TableCell>
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
                      <TableCell>{String(item.quantity)}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.location || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          qty={item.quantity}
                          threshold={item.lowStockThreshold}
                        />
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
