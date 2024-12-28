import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

export function UserManagementSection() {
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
  );
}