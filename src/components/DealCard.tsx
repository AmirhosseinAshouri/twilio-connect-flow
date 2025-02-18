
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCircle, MessageSquare, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DealForm } from "./DealForm";
import { useContact } from "@/hooks";
import { Link } from "react-router-dom";
import { Deal } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DealCardProps {
  deal: Deal;
  onUpdate: (updatedDeal: Deal) => void;
  provided: any;
}

export function DealCard({ deal, onUpdate, provided }: DealCardProps) {
  const { contact } = useContact(deal.contact_id);
  const [assignedUser, setAssignedUser] = useState<{ full_name: string } | null>(null);
  
  useEffect(() => {
    const fetchAssignedUser = async () => {
      if (!deal.assigned_to) {
        setAssignedUser(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', deal.assigned_to)
        .single();
      
      if (!error && data) {
        setAssignedUser(data);
      }
    };

    fetchAssignedUser();
  }, [deal.assigned_to]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="mb-3"
    >
      <Dialog>
        <DialogTrigger asChild>
          <Card className="hover:shadow-lg transition-shadow bg-white cursor-pointer">
            <CardHeader className="p-4">
              <CardTitle className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-base font-medium">{deal.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {deal.company}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {deal.notes && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {deal.notes}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    Created
                  </span>
                  <span className="text-xs font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(deal.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    Assigned To
                  </span>
                  <span className="text-xs font-medium flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {assignedUser ? assignedUser.full_name : 'Unassigned'}
                  </span>
                </div>
                {contact && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">
                      Contact
                    </span>
                    <Link 
                      to={`/contacts/${contact.id}`}
                      className="text-xs font-medium flex items-center hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserCircle className="h-3 w-3 mr-1" />
                      {contact.name}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <DealForm deal={deal} onSubmit={onUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
