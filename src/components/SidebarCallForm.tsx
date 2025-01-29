import { Phone } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/hooks";
import { CallForm } from "./CallForm";
import { useInitiateCall } from "@/hooks/useInitiateCall";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SidebarCallForm() {
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const { settings, loading: settingsLoading } = useSettings();
  const { initiateCall, isLoading } = useInitiateCall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await initiateCall({
      phone,
      notes
    });
    
    if (success) {
      setPhone("");
      setNotes("");
    }
  };

  const isTwilioConfigured = settings?.twilio_account_sid && 
                            settings?.twilio_auth_token && 
                            settings?.twilio_phone_number;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>Quick Call</span>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent className="px-2">
        {settingsLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : !isTwilioConfigured ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Missing Twilio Settings</AlertTitle>
            <AlertDescription>
              Configure Twilio settings first.
            </AlertDescription>
          </Alert>
        ) : (
          <CallForm
            phone={phone}
            notes={notes}
            isLoading={isLoading}
            settings={settings}
            onPhoneChange={setPhone}
            onNotesChange={setNotes}
            onSubmit={handleSubmit}
          />
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}