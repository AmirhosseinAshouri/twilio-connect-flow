import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Twilio Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-sid">Account SID</Label>
              <Input id="account-sid" placeholder="Enter your Twilio Account SID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-token">Auth Token</Label>
              <Input
                id="auth-token"
                type="password"
                placeholder="Enter your Twilio Auth Token"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-number">Twilio Phone Number</Label>
              <Input
                id="phone-number"
                placeholder="Enter your Twilio Phone Number"
              />
            </div>
            <Button>Save Twilio Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="Enter SMTP host" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" placeholder="Enter SMTP port" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" placeholder="Enter SMTP username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input
                id="smtp-pass"
                type="password"
                placeholder="Enter SMTP password"
              />
            </div>
            <Button>Save Email Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;