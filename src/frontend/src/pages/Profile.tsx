import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Loader2, Pencil, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useIsAdmin,
  useSaveProfile,
} from "../hooks/useQueries";

export default function Profile() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useCallerProfile();
  const { data: isAdmin = false } = useIsAdmin();
  const saveProfile = useSaveProfile();

  const [editingName, setEditingName] = useState(false);
  const [editingDept, setEditingDept] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [deptVal, setDeptVal] = useState("");
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toText() ?? "—";
  const initials =
    (profile?.name ?? "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const startEditName = () => {
    setNameVal(profile?.name ?? "");
    setEditingName(true);
  };

  const startEditDept = () => {
    setDeptVal(profile?.department ?? "");
    setEditingDept(true);
  };

  const saveName = async () => {
    try {
      await saveProfile.mutateAsync({
        name: nameVal,
        department: profile?.department ?? "",
      });
      toast.success("Name updated");
      setEditingName(false);
    } catch {
      toast.error("Failed to save name");
    }
  };

  const saveDept = async () => {
    try {
      await saveProfile.mutateAsync({
        name: profile?.name ?? "",
        department: deptVal,
      });
      toast.success("Department updated");
      setEditingDept(false);
    } catch {
      toast.error("Failed to save department");
    }
  };

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principalId).then(() => {
      setCopied(true);
      toast.success("Principal ID copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" data-ocid="profile.page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="text-xl bg-primary text-primary-foreground font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {profile?.name || "User"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.department || "No department set"}
          </p>
        </div>
      </div>

      <Separator />

      {/* Personal Info */}
      <Card data-ocid="profile.panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Display Name */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Display Name
            </Label>
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  data-ocid="profile.input"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="h-9 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                />
                <Button
                  size="icon"
                  variant="default"
                  className="h-9 w-9 shrink-0"
                  data-ocid="profile.save_button"
                  onClick={saveName}
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0"
                  data-ocid="profile.cancel_button"
                  onClick={() => setEditingName(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-foreground">
                  {profile?.name || "—"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-ocid="profile.edit_button"
                  onClick={startEditName}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Department / Designation
            </Label>
            {editingDept ? (
              <div className="flex items-center gap-2">
                <Input
                  data-ocid="profile.textarea"
                  value={deptVal}
                  onChange={(e) => setDeptVal(e.target.value)}
                  className="h-9 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveDept();
                    if (e.key === "Escape") setEditingDept(false);
                  }}
                />
                <Button
                  size="icon"
                  variant="default"
                  className="h-9 w-9 shrink-0"
                  data-ocid="profile.save_button"
                  onClick={saveDept}
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0"
                  data-ocid="profile.cancel_button"
                  onClick={() => setEditingDept(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-foreground">
                  {profile?.department || "—"}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  data-ocid="profile.edit_button"
                  onClick={startEditDept}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Role
            </Label>
            <div>
              <Badge
                data-ocid="profile.card"
                className={
                  isAdmin
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }
              >
                {isAdmin ? "Admin" : "Staff"}
              </Badge>
            </div>
          </div>

          {/* Member Since */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Member Since
            </Label>
            <p className="text-sm font-medium text-foreground">
              {new Date().getFullYear()}
            </p>
          </div>

          {/* Principal ID */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Principal ID
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted border border-border rounded-md px-3 py-2 font-mono text-foreground break-all">
                {principalId}
              </code>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0"
                data-ocid="profile.button"
                onClick={copyPrincipal}
                title="Copy Principal ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this ID with your admin to get a role assigned.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
