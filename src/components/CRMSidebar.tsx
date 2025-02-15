
import { Home, Users, PhoneCall, PieChart, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Contacts", icon: Users, path: "/contacts" },
  { title: "Deals", icon: PieChart, path: "/deals" },
  { title: "Communications", icon: PhoneCall, path: "/communications" },
  { title: "Quick Call", icon: PhoneCall, path: "/quick-call" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function CRMSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-xl font-bold text-crm-primary">CRM</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
