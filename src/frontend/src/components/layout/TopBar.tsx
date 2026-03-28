import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, Search } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface Props {
  userName: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  lowStockCount: number;
  onNavigate: (page: string) => void;
}

export default function TopBar({
  userName,
  searchValue,
  onSearchChange,
  lowStockCount,
  onNavigate,
}: Props) {
  const { clear } = useInternetIdentity();
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
      <p className="text-sm text-muted-foreground whitespace-nowrap">
        Welcome,{" "}
        <span className="font-semibold text-foreground">
          {userName || "User"}
        </span>
      </p>

      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="topbar.search_input"
            placeholder="Search inventory..."
            className="pl-9 h-8 text-sm"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            data-ocid="topbar.notification.button"
          >
            <Bell className="w-4 h-4" />
          </Button>
          {lowStockCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {lowStockCount > 9 ? "9+" : lowStockCount}
            </span>
          )}
        </div>

        <button
          type="button"
          data-ocid="topbar.user.button"
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="View profile"
        >
          <Avatar className="w-7 h-7">
            <AvatarFallback className="text-[11px] bg-primary text-primary-foreground">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {userName || "User"}
          </span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          data-ocid="topbar.secondary_button"
          onClick={clear}
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
