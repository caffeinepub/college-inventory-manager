import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ItemRequest, RequestStatus } from "../backend.d";
import {
  useAllInventoryItems,
  useAllRequests,
  useApproveRequest,
  useRejectRequest,
} from "../hooks/useQueries";
import { formatDate } from "../lib/categoryUtils";

const SKEL4 = ["a", "b", "c", "d"];

interface Props {
  isAdmin: boolean;
  identity?: { getPrincipal: () => { toString: () => string } } | null;
}

export default function Requests({ isAdmin, identity }: Props) {
  const { data: requests = [], isLoading } = useAllRequests();
  const { data: items = [] } = useAllInventoryItems();
  const approveReq = useApproveRequest();
  const rejectReq = useRejectRequest();

  const [tab, setTab] = useState("all");
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [resolveTarget, setResolveTarget] = useState<ItemRequest | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const itemMap = Object.fromEntries(items.map((i) => [String(i.id), i]));
  const myPrincipal = identity?.getPrincipal().toString();

  const displayRequests = requests.filter((r) => {
    if (!isAdmin && r.requestedBy.toString() !== myPrincipal) return false;
    if (tab === "pending") return r.status === RequestStatus.pending;
    if (tab === "approved") return r.status === RequestStatus.approved;
    if (tab === "rejected") return r.status === RequestStatus.rejected;
    return true;
  });

  const openResolve = (req: ItemRequest, action: "approve" | "reject") => {
    setResolveTarget(req);
    setResolveAction(action);
    setResolveNotes("");
    setResolveOpen(true);
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    try {
      if (resolveAction === "approve") {
        await approveReq.mutateAsync({
          id: resolveTarget.id,
          notes: resolveNotes,
        });
        toast.success("Request approved");
      } else {
        await rejectReq.mutateAsync({
          id: resolveTarget.id,
          notes: resolveNotes,
        });
        toast.success("Request rejected");
      }
      setResolveOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const StatusBadge = ({ status }: { status: RequestStatus }) => (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium",
        status === RequestStatus.pending && "bg-amber-100 text-amber-700",
        status === RequestStatus.approved && "bg-green-100 text-green-700",
        status === RequestStatus.rejected && "bg-red-100 text-red-700",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <div className="p-6 space-y-5">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">
            {isAdmin ? "All Requests" : "My Requests"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger data-ocid="requests.all.tab" value="all">
                All
              </TabsTrigger>
              <TabsTrigger data-ocid="requests.pending.tab" value="pending">
                Pending
              </TabsTrigger>
              <TabsTrigger data-ocid="requests.approved.tab" value="approved">
                Approved
              </TabsTrigger>
              <TabsTrigger data-ocid="requests.rejected.tab" value="rejected">
                Rejected
              </TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {isLoading ? (
                <div data-ocid="requests.loading_state" className="space-y-2">
                  {SKEL4.map((k) => (
                    <Skeleton key={k} className="h-10 w-full" />
                  ))}
                </div>
              ) : displayRequests.length === 0 ? (
                <div
                  data-ocid="requests.empty_state"
                  className="py-12 text-center text-muted-foreground text-sm"
                >
                  No requests found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayRequests.map((req, i) => {
                      const item = itemMap[String(req.itemId)];
                      return (
                        <TableRow
                          key={String(req.id)}
                          data-ocid={`requests.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {item?.name ?? `#${String(req.itemId)}`}
                          </TableCell>
                          <TableCell>{String(req.quantity)}</TableCell>
                          <TableCell>{req.department}</TableCell>
                          <TableCell className="max-w-[180px] truncate text-muted-foreground">
                            {req.reason}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(req.createdAt)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={req.status} />
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              {req.status === RequestStatus.pending && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-green-600 hover:text-green-700 gap-1"
                                    data-ocid={`requests.approve.button.${i + 1}`}
                                    onClick={() => openResolve(req, "approve")}
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />{" "}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-destructive hover:text-destructive gap-1"
                                    data-ocid={`requests.reject.button.${i + 1}`}
                                    onClick={() => openResolve(req, "reject")}
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog
        open={resolveOpen}
        onOpenChange={(o) => !o && setResolveOpen(false)}
      >
        <DialogContent data-ocid="requests.resolve.dialog" className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {resolveAction === "approve"
                ? "Approve Request"
                : "Reject Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                data-ocid="requests.resolve.notes.textarea"
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="requests.resolve.cancel_button"
              onClick={() => setResolveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="requests.resolve.confirm_button"
              variant={resolveAction === "approve" ? "default" : "destructive"}
              onClick={handleResolve}
              disabled={approveReq.isPending || rejectReq.isPending}
            >
              {approveReq.isPending || rejectReq.isPending
                ? "Processing..."
                : resolveAction === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
