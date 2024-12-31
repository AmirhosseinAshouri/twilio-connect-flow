import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
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
import { Deal, DealStage } from "@/types";
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
  const { deals, setDeals, updateDeal } = useDeals();
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('public:deals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'UPDATE') {
            setDeals((currentDeals) =>
              currentDeals.map((deal) =>
                deal.id === payload.new.id ? { ...deal, ...payload.new } : deal
              )
            );
            
            if (payload.old.stage !== payload.new.stage) {
              toast({
                title: "Deal Moved",
                description: `Deal "${payload.new.title}" moved to ${payload.new.stage}`,
              });
            }
          } else if (payload.eventType === 'INSERT') {
            setDeals((currentDeals) => [...currentDeals, payload.new as Deal]);
          } else if (payload.eventType === 'DELETE') {
            setDeals((currentDeals) =>
              currentDeals.filter((deal) => deal.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setDeals, toast]);

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

    const updatedDeal = { ...deal, stage: destination.droppableId as DealStage };
    setDeals(currentDeals =>
      currentDeals.map(d => d.id === draggableId ? updatedDeal : d)
    );

    const { error } = await supabase
      .from("deals")
      .update({ stage: destination.droppableId })
      .eq("id", draggableId);

    if (error) {
      setDeals(currentDeals =>
        currentDeals.map(d => d.id === draggableId ? deal : d)
      );
      
      toast({
        title: "Error updating deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
  };

  const handleAddDeal = async (values: Omit<Deal, "id" | "created_at" | "updated_at">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newDeal = {
      ...values,
      user_id: user.id,
      stage: "qualify" as DealStage,
    };

    const { data, error } = await supabase
      .from("deals")
      .insert([newDeal])
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