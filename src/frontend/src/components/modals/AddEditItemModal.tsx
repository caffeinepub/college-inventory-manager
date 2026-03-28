import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../../backend.d";
import { Category, useCreateItem, useUpdateItem } from "../../hooks/useQueries";
import { dateToNs, nsToDate } from "../../lib/categoryUtils";

interface Props {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const emptyForm = {
  name: "",
  category: Category.electrical as Category,
  quantity: "",
  unit: "",
  location: "",
  supplier: "",
  purchaseDate: "",
  cost: "",
  lowStockThreshold: "",
};

export default function AddEditItemModal({ open, onClose, item }: Props) {
  const [form, setForm] = useState(emptyForm);
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        category: item.category,
        quantity: String(item.quantity),
        unit: item.unit,
        location: item.location,
        supplier: item.supplier,
        purchaseDate:
          item.purchaseDate !== 0n
            ? nsToDate(item.purchaseDate).toISOString().split("T")[0]
            : "",
        cost: String(item.cost),
        lowStockThreshold: String(item.lowStockThreshold),
      });
    } else {
      setForm(emptyForm);
    }
  }, [item]);

  const set = (k: keyof typeof emptyForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: InventoryItem = {
      id: item?.id ?? 0n,
      name: form.name.trim(),
      category: form.category,
      quantity: BigInt(Number(form.quantity) || 0),
      unit: form.unit.trim(),
      location: form.location.trim(),
      supplier: form.supplier.trim(),
      purchaseDate: form.purchaseDate
        ? dateToNs(new Date(form.purchaseDate))
        : 0n,
      cost: Number(form.cost) || 0,
      lowStockThreshold: BigInt(Number(form.lowStockThreshold) || 5),
    };
    try {
      if (isEdit && item) {
        await updateItem.mutateAsync({ id: item.id, item: payload });
        toast.success("Item updated");
      } else {
        await createItem.mutateAsync(payload);
        toast.success("Item added");
      }
      onClose();
    } catch {
      toast.error("Operation failed");
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="item.dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Item Name *</Label>
              <Input
                data-ocid="item.input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. LED Bulb 9W"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as Category)}
              >
                <SelectTrigger data-ocid="item.category.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            </div>
            <div className="space-y-1.5">
              <Label>Unit *</Label>
              <Input
                data-ocid="item.unit.input"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="e.g. Pcs, Meters, Litres"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                data-ocid="item.quantity.input"
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Low Stock Threshold</Label>
              <Input
                data-ocid="item.threshold.input"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Location / Storeroom</Label>
              <Input
                data-ocid="item.location.input"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Store Room B"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input
                data-ocid="item.supplier.input"
                value={form.supplier}
                onChange={(e) => set("supplier", e.target.value)}
                placeholder="e.g. Sharma Electricals"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Date</Label>
              <Input
                data-ocid="item.date.input"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set("purchaseDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cost (₹)</Label>
              <Input
                data-ocid="item.cost.input"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => set("cost", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="item.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="item.submit_button"
              disabled={isPending}
            >
              {isPending ? "Saving..." : isEdit ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
