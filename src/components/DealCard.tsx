import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, User, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DealForm } from "./DealForm";
import { useContact } from "@/hooks";
import { Link } from "react-router-dom";

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    company: string;
    value: number;
    probability: number;
    stage: string;
    assignedTo?: string;
    contactId?: string;
  };
  onUpdate: (updatedDeal: any) => void;
  provided: any;
}

export function DealCard({ deal, onUpdate, provided }: DealCardProps) {
  const { contact } = useContact(deal.contactId);
  
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
          <div>
            <Card className="hover:shadow-lg transition-shadow bg-white cursor-pointer">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-lg">{deal.title}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {deal.company}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Value</span>
                    <span className="font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {deal.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Probability
                    </span>
                    <span className="font-medium">{deal.probability}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Assigned To
                    </span>
                    <span className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {getAssignedUserName(deal.assignedTo)}
                    </span>
                  </div>
                  {contact && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Contact
                      </span>
                      <Link 
                        to={`/contacts/${contact.id}`}
                        className="font-medium flex items-center hover:text-primary"
                      >
                        <UserCircle className="h-4 w-4 mr-1" />
                        {contact.name}
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <DealForm deal={deal} onSubmit={onUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}