import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  "data-ocid"?: string;
}

export function NavLink({
  active,
  onClick,
  children,
  "data-ocid": ocid,
}: Props) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
