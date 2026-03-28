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
import { useSubmitRequest } from "../../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  userDepartment: string;
}

export default function RequestItemModal({
  open,
  onClose,
  item,
  userDepartment,
}: Props) {
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [department, setDepartment] = useState(userDepartment);
  const submitRequest = useSubmitRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    try {
      await submitRequest.mutateAsync({
        itemId: item.id,
        department: department.trim(),
        quantity: BigInt(Number(quantity) || 1),
        reason: reason.trim(),
      });
      toast.success("Request submitted successfully");
      setQuantity("1");
      setReason("");
      onClose();
    } catch {
      toast.error("Failed to submit request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-ocid="request.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Item{item ? `: ${item.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Department *</Label>
            <Input
              data-ocid="request.department.input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Your department"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity *</Label>
            <Input
              data-ocid="request.quantity.input"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Textarea
              data-ocid="request.reason.textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need this item?"
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="request.cancel_button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="request.submit_button"
              disabled={submitRequest.isPending}
            >
              {submitRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
