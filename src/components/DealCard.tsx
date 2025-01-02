import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCircle, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DealForm } from "./DealForm";
import { useContact } from "@/hooks";
import { Link } from "react-router-dom";
import { Deal } from "@/types";

interface DealCardProps {
  deal: Deal;
  onUpdate: (updatedDeal: Deal) => void;
  provided: any;
}

export function DealCard({ deal, onUpdate, provided }: DealCardProps) {
  const { contact } = useContact(deal.contact_id);
  
  const getAssignedUserName = (userId?: string) => {
    if (!userId) return "Unassigned";
    const users: { [key: string]: string } = {
      "1": "Admin User",
      "2": "Jane Smith",
      "3": "John Doe",
    };
    return users[userId] || "Unknown User";
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="mb-4"
    >
      <Dialog>
        <DialogTrigger asChild>
          <Card className="hover:shadow-lg transition-shadow bg-white cursor-pointer">
            <CardHeader>
              <CardTitle className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-lg font-medium">{deal.title}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {deal.company}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deal.notes && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {deal.notes}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    Assigned To
                  </span>
                  <span className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {getAssignedUserName(deal.assigned_to)}
                  </span>
                </div>
                {contact && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">
                      Contact
                    </span>
                    <Link 
                      to={`/contacts/${contact.id}`}
                      className="font-medium flex items-center hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserCircle className="h-4 w-4 mr-1" />
                      {contact.name}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <DealForm deal={deal} onSubmit={onUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}