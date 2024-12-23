import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddDealForm } from "@/components/AddDealForm";
import { DealColumn } from "@/components/DealColumn";
import { useDeals } from "@/hooks/useDeals";
import { Deal, DealStage } from "@/types/deals";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stageColumns: { id: DealStage; title: string; color: string }[] = [
  { id: "qualify", title: "Qualify", color: "bg-gray-100" },
  { id: "cold", title: "Cold", color: "bg-blue-50" },
  { id: "warm", title: "Warm", color: "bg-orange-50" },
  { id: "hot", title: "Hot", color: "bg-red-50" },
];

const Deals = () => {
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const { deals, updateDeal } = useDeals();
  const { toast } = useToast();

  const onDragEnd = async (result: any) => {
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

    const { error } = await supabase
      .from("deals")
      .update({ stage: destination.droppableId as DealStage })
      .eq("id", draggableId);

    if (error) {
      toast({
        title: "Error updating deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deal Updated",
      description: `${deal.title} moved to ${destination.droppableId}`,
    });
  };

  const handleAddDeal = async (values: Omit<Deal, "id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("deals")
      .insert([{ ...values, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setIsAddDealOpen(false);
      toast({
        title: "Deal Added",
        description: `${data.title} has been added successfully.`,
      });
    }
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
                onUpdateDeal={updateDeal}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Deals;