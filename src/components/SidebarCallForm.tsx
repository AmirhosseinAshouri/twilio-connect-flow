
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { CallForm } from "./CallForm";

export function SidebarCallForm() {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            <span className="text-sm font-medium">Quick Call</span>
          </div>
          <CallForm />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
