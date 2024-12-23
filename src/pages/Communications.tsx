import { useCalls } from "@/hooks";
import { NewCallDialog } from "@/components/NewCallDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, MessageSquare, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Communications = () => {
  const { calls, loading } = useCalls();

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Communications</h1>
          <div className="flex gap-2">
            <NewCallDialog />
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" /> New SMS
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" /> New Email
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          ) : calls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No communications yet
              </CardContent>
            </Card>
          ) : (
            calls.map((call) => (
              <Card key={call.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-blue-500" />
                      {call.contact_id}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(call.created_at).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Duration: {call.duration} seconds
                    </p>
                    <p>{call.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Communications;