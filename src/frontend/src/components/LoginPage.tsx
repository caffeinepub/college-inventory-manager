import { Button } from "@/components/ui/button";
import { BarChart3, Package, Shield, Users } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const LOGO_PATH = "/assets/generated/svce-logo-nobg-transparent.png";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: Package,
      title: "Inventory Tracking",
      desc: "Manage electrical, plumbing, carpentry & housekeeping items",
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      desc: "Admin controls with staff request workflows",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      desc: "Category breakdowns, usage history, and low-stock alerts",
    },
    {
      icon: Users,
      title: "Issue Management",
      desc: "Track who has what and when",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-card rounded-2xl shadow-panel overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left panel */}
            <div className="bg-primary p-10 flex flex-col justify-between">
              <div>
                <div className="mb-8">
                  <div className="flex items-center justify-center">
                    <img
                      src="/assets/uploads/svcelogo-019d3d25-0374-748f-80a2-999b4a30ec21-1.png"
                      alt="SVCE Logo"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-white text-3xl font-bold leading-tight mb-4">
                  Manage Your College Inventory Efficiently
                </h1>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Centralized management of electrical, plumbing, carpentry, and
                  housekeeping materials for your institution.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white/10 rounded-xl p-3">
                    <Icon className="w-5 h-5 text-blue-200 mb-2" />
                    <p className="text-white text-xs font-semibold">{title}</p>
                    <p className="text-blue-200 text-xs mt-0.5 leading-tight">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right panel */}
            <div className="p-10 flex flex-col justify-center">
              <div className="flex justify-center mb-6">
                <img
                  src={LOGO_PATH}
                  alt="SVCE Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Sign in to access the inventory management dashboard.
              </p>
              <Button
                data-ocid="login.primary_button"
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Secured by Internet Identity. No passwords required.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
