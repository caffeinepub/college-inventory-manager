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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import type { InventoryItem } from "../../backend.d";
import { useIssueItem } from "../../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function IssueItemModal({ open, onClose, item }: Props) {
  const [issuedTo, setIssuedTo] = useState("");
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const issueItem = useIssueItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await issueItem.mutateAsync({
        itemId: item.id,
        issuedTo: issuedTo.trim(),
        department: department.trim(),
        quantity: BigInt(Number(quantity) || 1),
        notes: notes.trim(),
      });
      toast.success(`Issued ${quantity} ${item.unit} of ${item.name}`);
      setIssuedTo("");
      setDepartment("");
      setQuantity("1");
      setNotes("");
      onClose();
    } catch {
      toast.error("Failed to issue item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="issue.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Item{item ? `: ${item.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {item && (
            <div className="bg-muted rounded-lg px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">Available: </span>
              <span className="font-semibold text-foreground">
                {String(item.quantity)} {item.unit}
              </span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Issued To *</Label>
            <Input
              data-ocid="issue.issuedto.input"
              value={issuedTo}
              onChange={(e) => setIssuedTo(e.target.value)}
              placeholder="Staff name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Department *</Label>
            <Input
              data-ocid="issue.department.input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Hostel, Maintenance"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity *</Label>
            <Input
              data-ocid="issue.quantity.input"
              type="number"
              min="1"
              max={item ? String(item.quantity) : undefined}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              data-ocid="issue.notes.textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="issue.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="issue.submit_button"
              disabled={issueItem.isPending}
            >
              {issueItem.isPending ? "Issuing..." : "Issue Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
