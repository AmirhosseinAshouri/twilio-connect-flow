import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

const initialUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
  },
];

export default function Settings() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const { toast } = useToast();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: (users.length + 1).toString(),
      email: newUserEmail,
      name: newUserName,
      role: "user",
    };
    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserName("");
    toast({
      title: "User Added",
      description: `${newUserName} has been added successfully.`,
    });
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Users</h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email} - {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <form onSubmit={handleAddUser} className="space-y-4">
              <h3 className="text-lg font-semibold">Add New User</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Add User</Button>
            </form>
          </CardContent>
        </Card>

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
