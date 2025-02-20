import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import { useLeads } from "@/hooks/useLeads";
import { useCalls } from "@/hooks/useCalls";
import { DollarSign, Phone, Users, AtSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeadForm } from "@/components/LeadForm";

export default function Dashboard() {
  const {
    contacts
  } = useContacts();
  const {
    leads,
    updateLead
  } = useLeads();
  const {
    calls
  } = useCalls();
  const [mentionedLeads, setMentionedLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const fetchMentionedLeads = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data: mentions
      } = await supabase.from('mentions').select('lead_id').eq('mentioned_user_id', user.id);
      if (mentions && mentions.length > 0) {
        const leadIds = mentions.map(mention => mention.lead_id);
        const {
          data: leadsData
        } = await supabase.from('leads').select('*').in('id', leadIds).order('updated_at', {
          ascending: false
        });
        if (leadsData) {
          setMentionedLeads(leadsData as Lead[]);
        }
      }
    };
    fetchMentionedLeads();
  }, []);

  const handleLeadUpdate = (updatedLead: Lead) => {
    updateLead(updatedLead);
    setSelectedLead(null);
    setMentionedLeads(prev => prev.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  return <div className="p-8 space-y-8">
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

      {mentionedLeads.length > 0 && <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Leads You're Mentioned In</h2>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Note</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentionedLeads.map(lead => <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLead(lead)}>
                    <TableCell className="font-medium">{lead.title}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">
                        {lead.notes || "No notes yet"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(lead.updated_at), {
                  addSuffix: true
                })}
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </div>}

      <Dialog open={!!selectedLead} onOpenChange={open => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && <LeadForm lead={selectedLead} onSubmit={handleLeadUpdate} />}
        </DialogContent>
      </Dialog>
    </div>;
}
