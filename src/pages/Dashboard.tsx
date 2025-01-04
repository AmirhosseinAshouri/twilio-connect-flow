import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import { useDeals } from "@/hooks/useDeals";
import { useCalls } from "@/hooks/useCalls";
import { DollarSign, Phone, Users, AtSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DealForm } from "@/components/DealForm";

export default function Dashboard() {
  const { contacts } = useContacts();
  const { deals, updateDeal } = useDeals();
  const { calls } = useCalls();
  const [mentionedDeals, setMentionedDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    const fetchMentionedDeals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: mentions } = await supabase
        .from('mentions')
        .select('deal_id')
        .eq('mentioned_user_id', user.id);

      if (mentions && mentions.length > 0) {
        const dealIds = mentions.map(mention => mention.deal_id);
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .in('id', dealIds)
          .order('updated_at', { ascending: false });

        if (dealsData) {
          setMentionedDeals(dealsData as Deal[]);
        }
      }
    };

    fetchMentionedDeals();
  }, []);

  const handleDealUpdate = (updatedDeal: Deal) => {
    updateDeal(updatedDeal);
    setSelectedDeal(null);
    // Update the mentioned deals list
    setMentionedDeals(prev => 
      prev.map(deal => deal.id === updatedDeal.id ? updatedDeal : deal)
    );
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

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
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals?.length || 0}</div>
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

      {mentionedDeals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Deals You're Mentioned In</h2>
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
                {mentionedDeals.map((deal) => (
                  <TableRow 
                    key={deal.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">
                        {deal.notes || "No notes yet"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Dialog open={!!selectedDeal} onOpenChange={(open) => !open && setSelectedDeal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <DealForm deal={selectedDeal} onSubmit={handleDealUpdate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}