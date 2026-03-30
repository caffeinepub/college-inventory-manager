import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LoginPage from "./components/LoginPage";
import ProfileSetup from "./components/ProfileSetup";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCallerProfile,
  useIsAdmin,
  usePendingRequests,
} from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Requests from "./pages/Requests";
import StaffManagement from "./pages/StaffManagement";

function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Package className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{message ?? "Loading..."}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const queryClient = useQueryClient();
  const { actor, isFetching: actorFetching } = useActor();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: isAdmin = false, isLoading: loadingAdmin } = useIsAdmin();
  const { data: profile, isLoading: loadingProfile } = useCallerProfile();
  const { data: pendingRequests = [] } = usePendingRequests();

  const isConnecting = actorFetching || loadingAdmin || loadingProfile;

  // Start a timeout when connecting begins; clear it when done
  useEffect(() => {
    if (identity && isConnecting && !loadingTimedOut) {
      timerRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
      }, 8000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (!isConnecting) {
        setLoadingTimedOut(false);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [identity, isConnecting, loadingTimedOut]);

  useEffect(() => {
    if (!identity) setPage("dashboard");
  }, [identity]);

  if (isInitializing) {
    return <LoadingScreen message="Starting up..." />;
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (!actor) {
    return <LoadingScreen message="Connecting to SVCE..." />;
  }

  if (isConnecting && !loadingTimedOut) {
    return <LoadingScreen message="Connecting to SVCE..." />;
  }

  if (!profile) {
    const handleProfileComplete = () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
    };
    return (
      <>
        <ProfileSetup onComplete={handleProfileComplete} />
        <Toaster />
      </>
    );
  }

  const userName = profile?.name ?? "";
  const userDepartment = profile?.department ?? "";

  const handleNavigate = (p: string) => {
    setPage(p);
    setSearch("");
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return (
          <Inventory
            isAdmin={isAdmin}
            searchValue={search}
            userDepartment={userDepartment}
          />
        );
      case "requests":
        return <Requests isAdmin={isAdmin} identity={identity} />;
      case "reports":
        return <Reports />;
      case "staff":
        return <StaffManagement />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        pendingCount={pendingRequests.length}
        isAdmin={isAdmin}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          userName={userName}
          searchValue={search}
          onSearchChange={setSearch}
          lowStockCount={0}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-auto">{renderPage()}</main>
      </div>
      <Toaster />
    </div>
  );
}
