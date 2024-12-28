import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmailSettingsForm() {
  return (
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
  );
}