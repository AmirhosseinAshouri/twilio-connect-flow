import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DealForm } from "@/components/DealForm";

type DealStage = "qualify" | "cold" | "warm" | "hot";

interface Deal {
  id: string;
  title: string;
  value: number;
  company: string;
  stage: DealStage;
  probability: number;
}

const initialDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise Software License",
    value: 50000,
    company: "Acme Inc",
    stage: "warm",
    probability: 70,
  },
  {
    id: "2",
    title: "Consulting Services",
    value: 25000,
    company: "Tech Corp",
    stage: "cold",
    probability: 50,
  },
];

const stageColumns: { id: DealStage; title: string; color: string }[] = [
  { id: "qualify", title: "Qualify", color: "bg-gray-100" },
  { id: "cold", title: "Cold", color: "bg-blue-50" },
  { id: "warm", title: "Warm", color: "bg-orange-50" },
  { id: "hot", title: "Hot", color: "bg-red-50" },
];

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const { toast } = useToast();

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const deal = deals.find((d) => d.id === draggableId);
    if (!deal) return;

    const newDeals = deals.map((d) =>
      d.id === draggableId
        ? { ...d, stage: destination.droppableId as DealStage }
        : d
    );

    setDeals(newDeals);
    toast({
      title: "Deal Updated",
      description: `${deal.title} moved to ${destination.droppableId}`,
    });
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    setSelectedDeal(null);
    toast({
      title: "Deal Updated",
      description: `${updatedDeal.title} has been updated successfully.`,
    });
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Deals</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Deal
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stageColumns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{column.title}</h2>
                  <span className="text-sm text-muted-foreground">
                    {deals.filter((d) => d.stage === column.id).length} deals
                  </span>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`${column.color} p-4 rounded-lg min-h-[500px] transition-colors`}
                    >
                      {deals
                        .filter((deal) => deal.stage === column.id)
                        .map((deal, index) => (
                          <Draggable
                            key={deal.id}
                            draggableId={deal.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4"
                              >
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div onClick={() => setSelectedDeal(deal)}>
                                      <Card className="hover:shadow-lg transition-shadow bg-white cursor-pointer">
                                        <CardHeader>
                                          <CardTitle className="flex justify-between items-center">
                                            <span className="text-lg">
                                              {deal.title}
                                            </span>
                                            <span className="text-sm font-normal text-muted-foreground">
                                              {deal.company}
                                            </span>
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm text-muted-foreground">
                                                Value
                                              </span>
                                              <span className="font-medium flex items-center">
                                                <DollarSign className="h-4 w-4 mr-1" />
                                                {deal.value.toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm text-muted-foreground">
                                                Probability
                                              </span>
                                              <span className="font-medium">
                                                {deal.probability}%
                                              </span>
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
                                    {selectedDeal && (
                                      <DealForm
                                        deal={selectedDeal}
                                        onSubmit={handleUpdateDeal}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Deals;