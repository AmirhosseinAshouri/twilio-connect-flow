
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCircle, MessageSquare, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LeadForm } from "./LeadForm";
import { useContact } from "@/hooks";
import { Link } from "react-router-dom";
import { Lead } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

interface LeadCardProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  provided: any;
}

export function LeadCard({ lead, onUpdate, provided }: LeadCardProps) {
  const { contact } = useContact(lead.contact_id);
  const [assignedUser, setAssignedUser] = useState<{ full_name: string } | null>(null);
  const [latestNote, setLatestNote] = useState<Note | null>(null);
  
  useEffect(() => {
    const fetchAssignedUser = async () => {
      if (!lead.assigned_to) {
        setAssignedUser(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', lead.assigned_to)
        .single();
      
      if (!error && data) {
        setAssignedUser(data);
      }
    };

    const fetchLatestNote = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('deal_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setLatestNote(data);
      }
    };

    fetchAssignedUser();
    fetchLatestNote();
  }, [lead.assigned_to, lead.id]);

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
                <span className="text-base font-medium">{lead.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {lead.company}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {latestNote && (
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {latestNote.content}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">
                    Created
                  </span>
                  <span className="text-xs font-medium flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(lead.created_at)}
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
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm lead={lead} onSubmit={onUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
