import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DealForm } from "./DealForm";

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    company: string;
    value: number;
    probability: number;
    stage: string;
  };
  onUpdate: (updatedDeal: any) => void;
  provided: any;
}

export function DealCard({ deal, onUpdate, provided }: DealCardProps) {
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