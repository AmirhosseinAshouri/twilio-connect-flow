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

export default function Dashboard() {
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const { calls } = useCalls();
  const [mentionedDeals, setMentionedDeals] = useState<Deal[]>([]);

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
                  <TableHead>Company</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentionedDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>{deal.company}</TableCell>
                    <TableCell>
                      <span className="capitalize">{deal.stage}</span>
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
    </div>
  );
}