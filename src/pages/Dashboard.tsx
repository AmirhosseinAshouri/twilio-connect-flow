import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import { useLeads } from "@/hooks/useLeads";
import { useCalls } from "@/hooks/useCalls";
import { DollarSign, Phone, Users, Calendar, CheckSquare, Clock, CalendarClock, CalendarX } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";
import { Note } from "@/types/note";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { isToday, isPast, isFuture, startOfDay } from "date-fns";

export default function Dashboard() {
  const { contacts } = useContacts();
  const { leads, updateLead } = useLeads();
  const { calls } = useCalls();
  const [assignedNotes, setAssignedNotes] = useState<(Note & { lead: Lead })[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState("Today");

  const navItems = [
    { name: "Today", icon: Calendar },
    { name: "Upcoming", icon: CalendarClock },
    { name: "Overdue", icon: CalendarX },
  ];

  useEffect(() => {
    const fetchAssignedNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          id,
          deal_id,
          content,
          created_at,
          completed,
          user_id,
          due_date,
          lead:deals(*)
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching notes:', error);
        return;
      }

      if (notes) {
        const notesWithLead = notes.map(note => ({
          id: note.id,
          deal_id: note.deal_id,
          content: note.content,
          created_at: note.created_at,
          completed: note.completed,
          user_id: note.user_id,
          due_date: note.due_date,
          lead: note.lead as Lead
        }));
        setAssignedNotes(notesWithLead);
      }
    };

    fetchAssignedNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    return assignedNotes.filter(note => {
      if (!note.due_date) return false;
      
      const dueDate = new Date(note.due_date);
      const today = startOfDay(new Date());

      switch (activeTab) {
        case "Today":
          return isToday(dueDate);
        case "Upcoming":
          return isFuture(dueDate) && !isToday(dueDate);
        case "Overdue":
          return isPast(dueDate) && !isToday(dueDate);
        default:
          return true;
      }
    });
  }, [assignedNotes, activeTab]);

  const handleLeadUpdate = (updatedLead: Lead) => {
    updateLead(updatedLead);
    setSelectedLead(null);
  };

  const formatDueDate = (dueDate: string | null | undefined) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return "No due date";
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNoteCompletion = async (noteId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ completed })
        .eq('id', noteId);

      if (error) throw error;

      setAssignedNotes(prev => prev.filter(note => note.id !== noteId));
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
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Pending Tasks</h2>
            </div>
          </div>
          <NavBar 
            items={navItems} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="relative mb-4"
          />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.length > 0 ? (
                  filteredNotes.map(note => (
                    <TableRow 
                      key={note.id} 
                      className="cursor-pointer hover:bg-muted/50" 
                      onClick={() => setSelectedLead(note.lead)}
                    >
                      <TableCell className="font-medium">{note.content}</TableCell>
                      <TableCell>{note.lead.title}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDueDate(note.due_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          To Do
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No tasks found for this filter
                    </TableCell>
                  </TableRow>
                )}
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
