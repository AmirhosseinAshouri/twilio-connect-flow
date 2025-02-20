
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import { useLeads } from "@/hooks/useLeads";
import { useCalls } from "@/hooks/useCalls";
import { DollarSign, Phone, Users, AtSign, Calendar, CheckSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";
import { Note } from "@/types/note";

export default function Dashboard() {
  const { contacts } = useContacts();
  const { leads, updateLead } = useLeads();
  const { calls } = useCalls();
  const [assignedNotes, setAssignedNotes] = useState<(Note & { lead: Lead })[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchAssignedNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          *,
          lead:deals(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }

      if (notes) {
        setAssignedNotes(notes.map(note => ({
          ...note,
          lead: note.lead as Lead
        })));
      }
    };

    fetchAssignedNotes();
  }, []);

  const handleLeadUpdate = (updatedLead: Lead) => {
    updateLead(updatedLead);
    setSelectedLead(null);
  };

  const formatDueDate = (dueDate: string | undefined) => {
    if (!dueDate) return "No due date";
    return format(new Date(dueDate), 'MMM d, yyyy HH:mm');
  };

  const handleNoteCompletion = async (noteId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ completed })
        .eq('id', noteId);

      if (error) throw error;

      setAssignedNotes(prev => prev.map(note =>
        note.id === noteId ? { ...note, completed } : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8 mx-[8px] my-[36px]">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {assignedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Your Notes</h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedNotes.map(note => (
                  <TableRow 
                    key={note.id} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => setSelectedLead(note.lead)}
                  >
                    <TableCell className="font-medium">{note.content}</TableCell>
                    <TableCell>{note.lead.title}</TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={note.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleNoteCompletion(note.id, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={!!selectedLead} onOpenChange={open => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && <LeadForm lead={selectedLead} onSubmit={handleLeadUpdate} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
