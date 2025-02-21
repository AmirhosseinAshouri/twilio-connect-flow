
import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { CallForm } from "./CallForm";
import { useSettings } from "@/hooks/useSettings";

export function SidebarCallForm() {
  const [open, setOpen] = useState(false);
  const { settings, loading } = useSettings();
  
  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            <span className="text-sm font-medium">Quick Call</span>
          </div>
          <CallForm 
            phone=""
            notes=""
            isLoading={loading}
            settings={settings}
            onSubmit={() => {}}
            onPhoneChange={() => {}}
            onNotesChange={() => {}}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
