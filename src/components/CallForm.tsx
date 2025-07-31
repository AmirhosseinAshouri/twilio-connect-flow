
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TwilioSettings } from "@/hooks/useSettings";
import { PhoneCall } from "lucide-react";

interface CallFormProps {
  phone: string;
  notes: string;
  isLoading: boolean;
  settings: TwilioSettings | null;
  onPhoneChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CallForm({
  phone,
  notes,
  isLoading,
  settings,
  onPhoneChange,
  onNotesChange,
  onSubmit
}: CallFormProps) {
  // Debug button disabled state
  const isButtonDisabled = isLoading || !settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token;
  
  console.log('CallForm: Button state check:', {
    isLoading,
    hasSettings: !!settings,
    hasPhoneNumber: !!settings?.twilio_phone_number,
    hasAccountSid: !!settings?.twilio_account_sid,
    hasAuthToken: !!settings?.twilio_auth_token,
    isButtonDisabled
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="+1234567890"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Call notes..."
        />
      </div>
      <Button 
        type="submit" 
        disabled={isButtonDisabled}
        className="w-full flex items-center justify-center gap-2"
      >
        <PhoneCall className="h-4 w-4" />
        {isLoading ? "Initiating Call..." : "Start Call"}
      </Button>
    </form>
  );
}
