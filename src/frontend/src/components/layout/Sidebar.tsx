import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Package,
  Package2,
  UserCircle,
  Users,
} from "lucide-react";
import { NavLink } from "./NavLink";

interface Props {
  page: string;
  onNavigate: (page: string) => void;
  pendingCount: number;
  isAdmin: boolean;
}

export default function Sidebar({
  page,
  onNavigate,
  pendingCount,
  isAdmin,
}: Props) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
    ...(isAdmin ? [{ id: "staff", label: "Staff", icon: Users }] : []),
  ];

  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Package2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-none">
              SVCE
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              College Inventory
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <NavLink
            key={id}
            active={page === id}
            onClick={() => onNavigate(id)}
            data-ocid={`nav.${id}.link`}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1">{label}</span>
            {id === "requests" && isAdmin && pendingCount > 0 && (
              <Badge className="text-xs px-1.5 py-0 h-5 bg-destructive text-destructive-foreground">
                {pendingCount}
              </Badge>
            )}
          </NavLink>
        ))}

        {/* Profile link - separated */}
        <div className="pt-2 mt-2 border-t border-sidebar-border">
          <NavLink
            active={page === "profile"}
            onClick={() => onNavigate("profile")}
            data-ocid="nav.profile.link"
          >
            <UserCircle className="w-4 h-4" />
            <span className="flex-1">Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
