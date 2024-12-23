import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddDealForm } from "@/components/AddDealForm";
import { DealColumn } from "@/components/DealColumn";

type DealStage = "qualify" | "cold" | "warm" | "hot";

interface Deal {
  id: string;
  title: string;
  value: number;
  company: string;
  stage: DealStage;
  probability: number;
  assignedTo?: string;
}

const initialDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise Software License",
    value: 50000,
    company: "Acme Inc",
    stage: "warm",
    probability: 70,
    assignedTo: "1",
  },
  {
    id: "2",
    title: "Consulting Services",
    value: 25000,
    company: "Tech Corp",
    stage: "cold",
    probability: 50,
    assignedTo: "2",
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
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
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
    toast({
      title: "Deal Updated",
      description: `${updatedDeal.title} has been updated successfully.`,
    });
  };

  const handleAddDeal = (values: Omit<Deal, "id">) => {
    const newDeal = {
      ...values,
      id: `${deals.length + 1}`,
    };
    setDeals([...deals, newDeal]);
    setIsAddDealOpen(false);
    toast({
      title: "Deal Added",
      description: `${newDeal.title} has been added successfully.`,
    });
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Deals</h1>
          <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Deal</DialogTitle>
              </DialogHeader>
              <AddDealForm
                onSubmit={handleAddDeal}
                onCancel={() => setIsAddDealOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stageColumns.map((column) => (
              <DealColumn
                key={column.id}
                column={column}
                deals={deals.filter((d) => d.stage === column.id)}
                onUpdateDeal={handleUpdateDeal}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Deals;
