import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertTriangle,
  Download,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../backend.d";
import AddEditItemModal from "../components/modals/AddEditItemModal";
import IssueItemModal from "../components/modals/IssueItemModal";
import RequestItemModal from "../components/modals/RequestItemModal";
import {
  Category,
  useAllInventoryItems,
  useDeleteItem,
  useLowStockItems,
} from "../hooks/useQueries";
import { CATEGORY_CONFIG, getStockStatus } from "../lib/categoryUtils";

const SKEL6 = ["a", "b", "c", "d", "e", "f"];

interface Props {
  isAdmin: boolean;
  searchValue: string;
  userDepartment: string;
}

function csvEscape(v: string | bigint): string {
  const s = String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function exportToCSV(items: InventoryItem[]) {
  const headers = [
    "Name",
    "Category",
    "Quantity",
    "Unit",
    "Location",
    "Supplier",
    "Purchase Date",
    "Cost (INR)",
  ];
  const rows = items.map((item) => [
    item.name,
    item.category.charAt(0).toUpperCase() + item.category.slice(1),
    String(item.quantity),
    item.unit,
    item.location || "",
    item.supplier || "",
    item.purchaseDate || "",
    String(item.cost),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  // UTF-8 BOM so Excel opens it correctly
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `SVCE_Inventory_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Inventory({
  isAdmin,
  searchValue,
  userDepartment,
}: Props) {
  const { data: items = [], isLoading } = useAllInventoryItems();
  const { data: lowStock = [] } = useLowStockItems();
  const deleteItem = useDeleteItem();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueItem, setIssueItem] = useState<InventoryItem | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestItem, setRequestItem] = useState<InventoryItem | null>(null);

  const filtered = items.filter((item) => {
    const matchSearch =
      !searchValue ||
      item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.location.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchValue.toLowerCase());
    const matchCat =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteItem.mutateAsync(item.id);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleExport = () => {
    if (items.length === 0) {
      toast.error("No inventory items to export.");
      return;
    }
    exportToCSV(items);
    toast.success(`Exported ${items.length} items to CSV (opens in Excel).`);
  };

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
    <div className="p-6 space-y-5">
      {lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="inventory.low_stock.panel"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">
              {lowStock.length} item{lowStock.length > 1 ? "s" : ""}
            </span>{" "}
            running low.
          </p>
        </motion.div>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Inventory Items</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  data-ocid="inventory.search_input"
                  placeholder="Search..."
                  className="pl-8 h-8 w-44 text-sm"
                  value={searchValue}
                  readOnly
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger
                  data-ocid="inventory.category.select"
                  className="h-8 w-36 text-sm"
                >
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={Category.electrical}>
                    Electrical
                  </SelectItem>
                  <SelectItem value={Category.plumbing}>Plumbing</SelectItem>
                  <SelectItem value={Category.carpentry}>Carpentry</SelectItem>
                  <SelectItem value={Category.housekeeping}>
                    Housekeeping
                  </SelectItem>
                </SelectContent>
              </Select>
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="h-8 gap-1.5"
                    data-ocid="inventory.export.button"
                    disabled={isLoading || items.length === 0}
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </Button>
                  <Button
                    data-ocid="inventory.add.primary_button"
                    size="sm"
                    onClick={() => {
                      setEditItem(null);
                      setAddEditOpen(true);
                    }}
                    className="h-8 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div data-ocid="inventory.loading_state" className="p-6 space-y-2">
              {SKEL6.map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="inventory.empty_state"
              className="py-16 text-center text-muted-foreground text-sm"
            >
              {searchValue || categoryFilter !== "all"
                ? "No items match your filter."
                : "No inventory items yet."}
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  return (
                    <TableRow
                      key={String(item.id)}
                      data-ocid={`inventory.item.${i + 1}`}
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                data-ocid={`inventory.issue.button.${i + 1}`}
                                onClick={() => {
                                  setIssueItem(item);
                                  setIssueOpen(true);
                                }}
                                title="Issue"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                data-ocid={`inventory.edit_button.${i + 1}`}
                                onClick={() => {
                                  setEditItem(item);
                                  setAddEditOpen(true);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                data-ocid={`inventory.delete_button.${i + 1}`}
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              data-ocid={`inventory.request.button.${i + 1}`}
                              onClick={() => {
                                setRequestItem(item);
                                setRequestOpen(true);
                              }}
                            >
                              <Send className="w-3 h-3" /> Request
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddEditItemModal
        open={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditItem(null);
        }}
        item={editItem}
      />
      <IssueItemModal
        open={issueOpen}
        onClose={() => {
          setIssueOpen(false);
          setIssueItem(null);
        }}
        item={issueItem}
      />
      <RequestItemModal
        open={requestOpen}
        onClose={() => {
          setRequestOpen(false);
          setRequestItem(null);
        }}
        item={requestItem}
        userDepartment={userDepartment}
      />
    </div>
  );
}
