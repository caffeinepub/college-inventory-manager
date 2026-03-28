import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

interface Props {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        department: department.trim(),
      });
      toast.success("Profile saved!");
      onComplete();
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl shadow-panel p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">SVCE</p>
            <p className="text-xs text-muted-foreground">
              Complete your profile
            </p>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Set Up Your Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us your name and department to get started.
        </p>

        {/* Admin hint */}
        <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 mb-5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            <span className="font-semibold text-primary">First login?</span>{" "}
            You'll automatically be set as <strong>Admin</strong> — giving you
            full access to add items across all categories, manage inventory,
            and assign staff roles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Full Name</Label>
            <Input
              id="pname"
              data-ocid="profile.input"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dept">Department</Label>
            <Input
              id="dept"
              data-ocid="profile.department.input"
              placeholder="e.g. Maintenance, Hostel, Admin"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            data-ocid="profile.submit_button"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? "Saving..." : "Continue to Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
