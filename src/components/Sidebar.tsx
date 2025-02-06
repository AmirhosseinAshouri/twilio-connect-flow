import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Phone,
  Settings,
  DollarSign,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "TwilioClient",
    icon: LayoutDashboard,
    href: "/twilioclient",
  },
  {
    label: "Contacts",
    icon: Users,
    href: "/contacts",
  },
  {
    label: "Deals",
    icon: DollarSign,
    href: "/deals",
  },
  {
    label: "Communications",
    icon: Phone,
    href: "/communications",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-secondary/30">
      <div className="px-3 py-2 flex-1">
        <Link to="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            CRM
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                location.pathname === route.href
                  ? "text-primary bg-primary/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className="h-5 w-5 mr-3" />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 