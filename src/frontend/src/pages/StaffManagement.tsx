import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import { Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../hooks/useQueries";
import { useAssignRole, useCallerRole } from "../hooks/useQueries";

export default function StaffManagement() {
  const [principalInput, setPrincipalInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.user);
  const assignRole = useAssignRole();
  const { data: callerRole } = useCallerRole();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = principalInput.trim();
    if (!trimmed) return;
    try {
      const principal = Principal.fromText(trimmed);
      await assignRole.mutateAsync({ user: principal, role: selectedRole });
      toast.success(`Role "${selectedRole}" assigned successfully.`);
      setPrincipalInput("");
    } catch (err: any) {
      if (
        err?.message?.includes("Invalid") ||
        err?.message?.includes("principal")
      ) {
        toast.error("Invalid Principal ID. Please check and try again.");
      } else {
        toast.error(
          "Failed to assign role. You may not have admin privileges.",
        );
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            Staff Management
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Assign roles to staff members using their Internet Identity Principal
          ID.
        </p>
      </motion.div>

      {/* Current role info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Your current role:{" "}
                  <span className="text-primary capitalize">
                    {callerRole ?? "loading..."}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Only Admins can assign roles to other users.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Assign role form */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Assign Role to Staff Member
            </CardTitle>
            <CardDescription>
              Paste the user's Principal ID (from their Internet Identity login)
              and select the role to grant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="principal">Principal ID</Label>
                <Input
                  id="principal"
                  data-ocid="staff.principal.input"
                  placeholder="e.g. aaaaa-aa or rdmx6-jaaaa-aaaaa-aaadq-cai"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Staff can find their Principal ID on their profile page after
                  logging in.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as UserRole)}
                >
                  <SelectTrigger
                    id="role"
                    data-ocid="staff.role.select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.admin}>
                      Admin — Full access, can manage inventory and staff
                    </SelectItem>
                    <SelectItem value={UserRole.user}>
                      Staff — Can browse inventory and submit requests
                    </SelectItem>
                    <SelectItem value={UserRole.guest}>
                      Guest — Read-only access
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                data-ocid="staff.assign.primary_button"
                disabled={assignRole.isPending || !principalInput.trim()}
                className="w-full"
              >
                {assignRole.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Role"
                )}
              </Button>

              {assignRole.isError && (
                <p
                  data-ocid="staff.assign.error_state"
                  className="text-xs text-destructive text-center"
                >
                  Failed to assign role. Ensure you have admin privileges.
                </p>
              )}
              {assignRole.isSuccess && (
                <p
                  data-ocid="staff.assign.success_state"
                  className="text-xs text-green-600 text-center"
                >
                  Role assigned successfully!
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* How-to instructions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">How to onboard staff</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground list-none">
              {[
                {
                  step: "1",
                  text: "Ask your staff member to sign in using Internet Identity.",
                },
                {
                  step: "2",
                  text: "They complete their profile (name and department).",
                },
                {
                  step: "3",
                  text: "They share their Principal ID with you (shown on their profile page).",
                },
                {
                  step: "4",
                  text: "Paste their Principal ID above and assign the Staff role.",
                },
                {
                  step: "5",
                  text: "They now have access to browse inventory and submit item requests.",
                },
              ].map(({ step, text }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center justify-center">
                    {step}
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
