import { format } from "date-fns";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommunications, Communication } from "@/hooks/useCommunications";
import { useCalls } from "@/hooks/useCalls";
import { Call } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunicationHistoryProps {
  contactId: string;
}

export function CommunicationHistory({ contactId }: CommunicationHistoryProps) {
  const { communications, loading: communicationsLoading } = useCommunications(contactId);
  const { calls, loading: callsLoading } = useCalls();

  const filteredCalls = calls.filter(call => call.contact_id === contactId);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderCommunicationItem = (item: Communication | Call, type: 'communication' | 'call') => {
    const date = format(new Date(item.created_at), 'MMM d, yyyy h:mm a');
    
    if (type === 'call') {
      const call = item as Call;
      return (
        <div key={call.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
          <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="font-medium">Call</span>
              <span className="text-sm text-muted-foreground">{date}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{call.notes || 'No notes'}</p>
            <span className="text-sm text-muted-foreground">Duration: {call.duration || 0}s</span>
          </div>
        </div>
      );
    }

    const comm = item as Communication;
    return (
      <div key={comm.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg">
        {renderIcon(comm.type)}
        <div className="flex-1">
          <div className="flex justify-between">
            <span className="font-medium">
              {comm.type.toUpperCase()} - {comm.direction}
            </span>
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          {comm.subject && (
            <p className="text-sm font-medium mt-1">Subject: {comm.subject}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{comm.content}</p>
        </div>
      </div>
    );
  };

  if (communicationsLoading || callsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communication History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const allCommunications = [
    ...filteredCalls.map(call => ({ ...call, type: 'call' })),
    ...communications,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {allCommunications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No communication history yet
            </p>
          ) : (
            allCommunications.map((item) => 
              renderCommunicationItem(
                item,
                'type' in item && item.type !== 'call' ? 'communication' : 'call'
              )
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}