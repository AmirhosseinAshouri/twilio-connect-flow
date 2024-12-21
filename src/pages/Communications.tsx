import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, MessageSquare, Mail } from "lucide-react";

const mockCommunications = [
  {
    id: "1",
    type: "call",
    contact: "John Doe",
    timestamp: "2024-02-20T10:30:00",
    duration: "15 mins",
    notes: "Discussed project requirements",
  },
  {
    id: "2",
    type: "sms",
    contact: "Jane Smith",
    timestamp: "2024-02-20T09:15:00",
    content: "Following up on our meeting",
  },
];

const Communications = () => {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Communications</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <PhoneCall className="mr-2 h-4 w-4" /> New Call
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" /> New SMS
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" /> New Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {mockCommunications.map((comm) => (
            <Card key={comm.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <div className="flex items-center gap-2">
                    {comm.type === "call" ? (
                      <PhoneCall className="h-4 w-4 text-blue-500" />
                    ) : comm.type === "sms" ? (
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    ) : (
                      <Mail className="h-4 w-4 text-purple-500" />
                    )}
                    {comm.contact}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {new Date(comm.timestamp).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comm.type === "call" ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Duration: {comm.duration}
                      </p>
                      <p>{comm.notes}</p>
                    </>
                  ) : (
                    <p>{comm.content}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Communications;