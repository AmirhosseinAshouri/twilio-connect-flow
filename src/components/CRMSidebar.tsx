
import { Home, Users, PhoneCall, PieChart, Settings, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const menuItems = [
  { title: "Dashboard", icon: Home, path: "/" },
  { title: "Contacts", icon: Users, path: "/contacts" },
  { title: "Deals", icon: PieChart, path: "/deals" },
  { title: "Communications", icon: PhoneCall, path: "/communications" },
  { title: "Quick Call", icon: PhoneCall, path: "/quick-call" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const Navigation = () => (
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
);

export function CRMSidebar() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="lg" 
            className="fixed top-3 left-3 z-50 h-12 w-12 rounded-full hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <div className="h-full bg-sidebar">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="pt-4">
                  <span className="text-xl font-bold text-crm-primary">CRM</span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <Navigation />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="text-xl font-bold text-crm-primary">CRM</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Navigation />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
