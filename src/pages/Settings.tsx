import { TwilioSettingsForm } from "@/components/settings/TwilioSettingsForm";
import { UserManagementSection } from "@/components/settings/UserManagementSection";
import { EmailSettingsForm } from "@/components/settings/EmailSettingsForm";

export default function Settings() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <UserManagementSection />
        <TwilioSettingsForm />
        <EmailSettingsForm />
      </div>
    </div>
  );
}