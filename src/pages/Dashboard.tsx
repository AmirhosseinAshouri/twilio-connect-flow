import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContacts } from "@/hooks/useContacts";
import { useDeals } from "@/hooks/useDeals";
import { useCalls } from "@/hooks/useCalls";
import { DollarSign, Phone, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { contacts, loading: contactsLoading } = useContacts();
  const { deals, loading: dealsLoading } = useDeals();
  const { calls, loading: callsLoading } = useCalls();

  // Calculate total deal value
  const totalDealValue = deals?.reduce((total, deal) => total + (deal.value || 0), 0) || 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    loading, 
    format = (val: number) => val.toString() 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{format(value)}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Contacts"
          value={contacts?.length || 0}
          icon={Users}
          loading={contactsLoading}
        />

        <StatCard
          title="Total Deals"
          value={totalDealValue}
          icon={DollarSign}
          loading={dealsLoading}
          format={(val) => `$${val.toLocaleString()}`}
        />

        <StatCard
          title="Total Calls"
          value={calls?.length || 0}
          icon={Phone}
          loading={callsLoading}
        />
      </div>
    </div>
  );
} 