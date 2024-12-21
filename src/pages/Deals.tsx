import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign } from "lucide-react";

const mockDeals = [
  {
    id: "1",
    title: "Enterprise Software License",
    value: 50000,
    company: "Acme Inc",
    stage: "Negotiation",
    probability: 70,
  },
  {
    id: "2",
    title: "Consulting Services",
    value: 25000,
    company: "Tech Corp",
    stage: "Proposal",
    probability: 50,
  },
];

const Deals = () => {
  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Deals</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Deal
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
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
                    <span className="text-sm text-muted-foreground">Stage</span>
                    <span className="font-medium">{deal.stage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Probability
                    </span>
                    <span className="font-medium">{deal.probability}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Deals;